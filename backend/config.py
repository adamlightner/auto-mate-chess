from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    stockfish_path: str = "/usr/local/bin/stockfish"
    database_url: str = "sqlite:///./data/chess_app.db"
    stockfish_depth: int = 18          # used for analysis stream only
    stockfish_move_time: float = 0.5   # seconds per engine move
    stockfish_elo_limit: int = 1500

    class Config:
        env_file = ".env"


settings = Settings()
