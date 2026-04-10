from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.game import Game
from models.user import User

router = APIRouter(prefix="/elo")

USER_ID = 1


@router.get("/current")
def get_current_elo(db: Session = Depends(get_db)):
    user = db.get(User, USER_ID)
    return {"elo": user.elo if user else 1200}


@router.get("/history")
def get_elo_history(db: Session = Depends(get_db)):
    games = (
        db.query(Game)
        .filter(Game.user_id == USER_ID)
        .order_by(Game.created_at)
        .all()
    )
    return [
        {
            "game_id": g.id,
            "result": g.result,
            "termination": g.termination,
            "elo_before": g.elo_before,
            "elo_after": g.elo_after,
            "elo_delta": g.elo_after - g.elo_before,
            "engine_elo": g.engine_elo,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        }
        for g in games
    ]
