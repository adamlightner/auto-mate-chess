import io
import uuid
from typing import Optional

import chess
import chess.pgn
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from database import get_db
from models.game import Game
from models.user import User
from services.elo import new_elo
from services.stockfish import stockfish_service
from store import GameRecord, games

router = APIRouter(prefix="/game")

# ── Move classification helpers ──────────────────────────────────────────────

def _cp_loss(eval_before: int, eval_after: int, player_is_white: bool) -> int:
    """Positive = player lost centipawns; negative = player improved."""
    return (eval_before - eval_after) if player_is_white else (eval_after - eval_before)


def _is_en_prise(board_before: chess.Board, move: chess.Move) -> bool:
    """True when the moved piece lands on a square attacked by the opponent (sacrifice heuristic)."""
    board_after = board_before.copy()
    board_after.push(move)
    piece = board_after.piece_at(move.to_square)
    if piece is None:
        return False
    return bool(board_after.attackers(not piece.color, move.to_square))


def _classify(cp_loss: int, en_prise: bool) -> str:
    if cp_loss <= 5 and en_prise:
        return "brilliant"
    if cp_loss <= 0:
        return "best"
    if cp_loss <= 10:
        return "excellent"
    if cp_loss <= 25:
        return "good"
    if cp_loss <= 100:
        return "inaccuracy"
    if cp_loss <= 200:
        return "mistake"
    return "blunder"

USER_ID = 1  # single-user app

_PROMOTION_MAP = {"q": chess.QUEEN, "r": chess.ROOK, "b": chess.BISHOP, "n": chess.KNIGHT}


class MoveRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_sq: str = Field(alias="from")
    to_sq: str = Field(alias="to")
    promotion: Optional[str] = None
    classify: bool = False


class NewGameRequest(BaseModel):
    engine_elo: int = 1200
    player_color: str = "white"  # "white" or "black"


@router.post("/new", status_code=201)
async def new_game(req: NewGameRequest = NewGameRequest()):
    game_id = uuid.uuid4().hex
    board = chess.Board()
    games[game_id] = GameRecord(board=board, player_color=req.player_color)
    await stockfish_service.set_elo(req.engine_elo)

    engine_move = None
    if req.player_color == "black":
        # Engine plays white's first move automatically
        engine_uci, engine_san, _ = await stockfish_service.get_engine_move(board.fen())
        move = chess.Move.from_uci(engine_uci)
        board.push(move)
        engine_move = {"san": engine_san, "uci": engine_uci}

    return {
        "game_id": game_id,
        "fen": board.fen(),
        "turn": "w" if board.turn == chess.WHITE else "b",
        "engine_move": engine_move,
    }


@router.post("/{game_id}/move")
async def make_move(game_id: str, req: MoveRequest, db: Session = Depends(get_db)):
    if game_id not in games:
        raise HTTPException(404, "Game not found")

    record = games[game_id]
    board = record.board

    if board.is_game_over():
        raise HTTPException(409, "Game is already over")

    eval_before = record.last_eval_cp
    player_is_white = record.player_color == "white"

    # --- Apply player move ---
    try:
        from_sq = chess.parse_square(req.from_sq)
        to_sq = chess.parse_square(req.to_sq)
        promo = _PROMOTION_MAP.get(req.promotion.lower()) if req.promotion else None
        move = chess.Move(from_sq, to_sq, promotion=promo)
        if move not in board.legal_moves:
            raise HTTPException(422, f"Illegal move: {req.from_sq}-{req.to_sq}")
        player_san = board.san(move)
        player_uci = move.uci()
        board_snapshot = board.copy()  # snapshot before move for en-prise check
        board.push(move)
    except (ValueError, KeyError):
        raise HTTPException(422, f"Illegal move: {req.from_sq}-{req.to_sq}")

    if board.is_game_over():
        elo_delta, result_str = _finish_game(db, board, game_id)
        return {
            "player_move": {"san": player_san, "uci": player_uci},
            "engine_move": None,
            "fen": board.fen(),
            "turn": "w" if board.turn == chess.WHITE else "b",
            "game_over": _outcome(board),
            "result": result_str,
            "elo_delta": elo_delta,
            "move_classification": None,
        }

    # --- Engine replies ---
    engine_uci, engine_san, eval_after_player = await stockfish_service.get_engine_move(board.fen())

    if req.classify:
        loss = _cp_loss(eval_before, eval_after_player, player_is_white)
        move_classification = _classify(loss, _is_en_prise(board_snapshot, move))
    else:
        move_classification = None

    engine_move = chess.Move.from_uci(engine_uci)
    board.push(engine_move)

    elo_delta = None
    result_str = None
    if board.is_game_over():
        elo_delta, result_str = _finish_game(db, board, game_id)

    return {
        "player_move": {"san": player_san, "uci": player_uci},
        "engine_move": {"san": engine_san, "uci": engine_uci},
        "fen": board.fen(),
        "turn": "w" if board.turn == chess.WHITE else "b",
        "game_over": _outcome(board) if board.is_game_over() else None,
        "result": result_str,
        "elo_delta": elo_delta,
        "move_classification": move_classification,
    }


@router.post("/{game_id}/resign", status_code=200)
async def resign_game(game_id: str, db: Session = Depends(get_db)):
    if game_id not in games:
        raise HTTPException(404, "Game not found")
    board = games[game_id].board
    elo_delta, _ = _finish_game(db, board, game_id, result_override="loss")
    return {"result": "resigned", "elo_delta": elo_delta}


@router.post("/{game_id}/undo", status_code=200)
async def undo_move(game_id: str):
    if game_id not in games:
        raise HTTPException(404, "Game not found")
    board = games[game_id].board
    count = min(2, len(board.move_stack))
    for _ in range(count):
        board.pop()
    return {"fen": board.fen(), "undone": count}


# --- helpers ---

def _finish_game(
    db: Session,
    board: chess.Board,
    game_id: str,
    result_override: str | None = None,
) -> tuple[int, str]:
    """Save game to DB, update user ELO. Returns (elo_delta, result_str)."""
    user = db.get(User, USER_ID)
    assert user is not None

    record = games.get(game_id)
    player_is_white = (record is None) or (record.player_color == "white")

    if result_override:
        result_str = result_override
        score = {"win": 1.0, "loss": 0.0, "draw": 0.5}[result_override]
    else:
        outcome = board.outcome()
        if outcome and outcome.winner == chess.WHITE:
            result_str = "win" if player_is_white else "loss"
            score = 1.0 if player_is_white else 0.0
        elif outcome and outcome.winner == chess.BLACK:
            result_str = "loss" if player_is_white else "win"
            score = 0.0 if player_is_white else 1.0
        else:
            result_str, score = "draw", 0.5

    elo_before = user.elo
    elo_after = new_elo(elo_before, stockfish_service.current_elo, score)
    user.elo = elo_after

    pgn_str = _board_to_pgn(board)

    db.add(Game(
        user_id=USER_ID,
        pgn=pgn_str,
        result=result_str,
        termination=_outcome(board),
        elo_before=elo_before,
        elo_after=elo_after,
        engine_elo=stockfish_service.current_elo,
    ))
    db.commit()

    # Remove from in-memory store
    games.pop(game_id, None)

    return elo_after - elo_before, result_str


def _board_to_pgn(board: chess.Board) -> str:
    game = chess.pgn.Game.from_board(board)
    buf = io.StringIO()
    print(game, file=buf, end="")
    return buf.getvalue()


def _outcome(board: chess.Board) -> str:
    outcome = board.outcome()
    if outcome is None:
        return "draw"
    return outcome.termination.name.lower()
