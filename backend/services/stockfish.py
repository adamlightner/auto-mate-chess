import asyncio
import chess
import chess.engine

from config import settings


class StockfishService:
    def __init__(self) -> None:
        self._engine: chess.engine.UciProtocol | None = None
        self._lock = asyncio.Lock()
        self.current_elo: int = settings.stockfish_elo_limit

    async def start(self) -> None:
        _, self._engine = await chess.engine.popen_uci(settings.stockfish_path)
        await self._engine.configure({
            "UCI_LimitStrength": True,
            "UCI_Elo": self.current_elo,
        })

    async def stop(self) -> None:
        if self._engine:
            try:
                await self._engine.quit()
            except Exception:
                pass
            self._engine = None

    async def set_elo(self, elo: int) -> None:
        # Stockfish UCI_Elo minimum is 1320, maximum is 3190
        clamped = max(1320, min(3190, elo))
        self.current_elo = clamped
        if self._engine:
            await self._engine.configure({
                "UCI_LimitStrength": True,
                "UCI_Elo": clamped,
            })

    async def get_engine_move(self, fen: str) -> tuple[str, str, int]:
        """Return (uci, san, eval_cp) for the best move in the given position."""
        assert self._engine is not None, "Engine not started"
        async with self._lock:
            board = chess.Board(fen)
            result = await self._engine.play(
                board,
                chess.engine.Limit(time=settings.stockfish_move_time),
                info=chess.engine.INFO_SCORE,
            )
            move = result.move
            assert move is not None
            san = board.san(move)
            uci = move.uci()
            cp = _extract_cp(result.info.get("score"))
            return uci, san, cp

    async def stream_analysis(self, fen: str, queue: asyncio.Queue) -> None:
        """Stream depth-by-depth analysis into queue; put None as sentinel when done."""
        assert self._engine is not None, "Engine not started"
        async with self._lock:
            board = chess.Board(fen)
            last: dict = {}
            async with self._engine.analysis(
                board, chess.engine.Limit(depth=settings.stockfish_depth)
            ) as analysis:
                async for info in analysis:
                    if "depth" not in info or "score" not in info:
                        continue
                    score = info["score"].white()
                    pv = info.get("pv", [])
                    msg = {
                        "type": "eval_update",
                        "depth": info["depth"],
                        "score_cp": None if score.is_mate() else score.score(),
                        "score_mate": score.mate() if score.is_mate() else None,
                        "best_move_uci": pv[0].uci() if pv else None,
                        "pv": [m.uci() for m in pv[:3]],
                    }
                    last = msg
                    await queue.put(msg)

            # Final summary message
            await queue.put({
                "type": "eval_done",
                "depth": last.get("depth", 0),
                "score_cp": last.get("score_cp"),
                "score_mate": last.get("score_mate"),
                "best_move_uci": last.get("best_move_uci"),
            })
            await queue.put(None)  # sentinel — tells WS handler to stop reading


def _extract_cp(pov_score: chess.engine.PovScore | None) -> int:
    if pov_score is None:
        return 0
    score = pov_score.white()
    if score.is_mate():
        return 30000 if (score.mate() or 0) > 0 else -30000
    return score.score() or 0


stockfish_service = StockfishService()
