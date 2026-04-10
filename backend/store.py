import asyncio
from dataclasses import dataclass, field
import chess


@dataclass
class GameRecord:
    board: chess.Board
    eval_queue: asyncio.Queue = field(default_factory=asyncio.Queue)


games: dict[str, GameRecord] = {}
