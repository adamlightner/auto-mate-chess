from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, SessionLocal, engine
from models import game, user  # noqa: F401 — ensure models are registered with Base
from models.user import User
from routers.elo import router as elo_router
from routers.game import router as game_router
from services.stockfish import stockfish_service
from ws.engine_stream import engine_stream


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure the data directory exists (SQLite needs the parent dir to exist)
    if settings.database_url.startswith("sqlite:///"):
        db_path = settings.database_url.replace("sqlite:///", "")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    # Create DB tables
    Base.metadata.create_all(bind=engine)

    # Seed default user (id=1, elo=1200)
    with SessionLocal() as db:
        if not db.get(User, 1):
            db.add(User(id=1, elo=1200))
            db.commit()

    await stockfish_service.start()
    yield
    await stockfish_service.stop()


app = FastAPI(title="AutoMate API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game_router)
app.include_router(elo_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.websocket("/ws/engine/{game_id}")
async def ws_engine(websocket: WebSocket, game_id: str):
    await engine_stream(websocket, game_id)
