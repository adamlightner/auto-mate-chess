from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    elo = Column(Integer, default=1200, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
