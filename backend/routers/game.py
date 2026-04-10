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

USER_ID = 1  # single-user app

_PROMOTION_MAP = {"q": chess.QUEEN, "r": chess.ROOK, "b": chess.BISHOP, "n": chess.KNIGHT}


class MoveRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_sq: str = Field(alias="from")
    to_sq: str = Field(alias="to")
    promotion: Optional[str] = None


class NewGameRequest(BaseModel):
    engine_elo: int = 1200


@router.post("/new", status_code=201)
async def new_game(req: NewGameRequest = NewGameRequest()):
    game_id = uuid.uuid4().hex
    games[game_id] = GameRecord(board=chess.Board())
    await stockfish_service.set_elo(req.engine_elo)
    return {"game_id": game_id, "fen": chess.Board().fen(), "turn": "w"}


@router.post("/{game_id}/move")
async def make_move(game_id: str, req: MoveRequest, db: Session = Depends(get_db)):
    if game_id not in games:
        raise HTTPException(404, "Game not found")

    record = games[game_id]
    board = record.board

    if board.is_game_over():
        raise HTTPException(409, "Game is already over")

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
        board.push(move)
    except (ValueError, KeyError):
        raise HTTPException(422, f"Illegal move: {req.from_sq}-{req.to_sq}")

    if board.is_game_over():
        elo_delta = _finish_game(db, board, game_id)
        return {
            "player_move": {"san": player_san, "uci": player_uci},
            "engine_move": None,
            "fen": board.fen(),
            "turn": "w" if board.turn == chess.WHITE else "b",
            "game_over": _outcome(board),
            "elo_delta": elo_delta,
        }

    # --- Engine replies ---
    engine_uci, engine_san, _ = await stockfish_service.get_engine_move(board.fen())
    engine_move = chess.Move.from_uci(engine_uci)
    board.push(engine_move)

    elo_delta = None
    if board.is_game_over():
        elo_delta = _finish_game(db, board, game_id)

    return {
        "player_move": {"san": player_san, "uci": player_uci},
        "engine_move": {"san": engine_san, "uci": engine_uci},
        "fen": board.fen(),
        "turn": "w" if board.turn == chess.WHITE else "b",
        "game_over": _outcome(board) if board.is_game_over() else None,
        "elo_delta": elo_delta,
    }


@router.post("/{game_id}/resign", status_code=200)
async def resign_game(game_id: str, db: Session = Depends(get_db)):
    if game_id not in games:
        raise HTTPException(404, "Game not found")
    board = games[game_id].board
    elo_delta = _finish_game(db, board, game_id, result_override="loss")
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

def _finish_game(db: Session, board: chess.Board, game_id: str, result_override: str | None = None) -> int:
    """Save game to DB, update user ELO. Returns ELO delta."""
    user = db.get(User, USER_ID)
    assert user is not None

    if result_override:
        result_str = result_override
        score = {"win": 1.0, "loss": 0.0, "draw": 0.5}[result_override]
    else:
        outcome = board.outcome()
        if outcome and outcome.winner == chess.WHITE:
            result_str, score = "win", 1.0
        elif outcome and outcome.winner == chess.BLACK:
            result_str, score = "loss", 0.0
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

    return elo_after - elo_before


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
