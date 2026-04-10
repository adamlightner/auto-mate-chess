from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pgn = Column(String, nullable=False)
    result = Column(String, nullable=False)   # "win" | "loss" | "draw"
    termination = Column(String, nullable=False)  # "checkmate" | "stalemate" | etc.
    elo_before = Column(Integer, nullable=False)
    elo_after = Column(Integer, nullable=False)
    engine_elo = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
