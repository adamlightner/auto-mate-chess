import asyncio
from dataclasses import dataclass, field
import chess


@dataclass
class GameRecord:
    board: chess.Board
    player_color: str = "white"  # "white" or "black"
    eval_queue: asyncio.Queue = field(default_factory=asyncio.Queue)
    last_eval_cp: int = 20  # eval (white's POV) before the next player move; ~20 = starting position


games: dict[str, GameRecord] = {}
