# AutoMate

An AI-assisted chess platform for improving your ELO rating. Play against Stockfish at adjustable difficulty, drill openings, solve tactical puzzles, and get move-by-move explanations powered by Claude.

---

## Features

- **Play vs Bot** — play against Stockfish with an adjustable ELO rating (1320–3190)
- **Real-time eval bar** — live centipawn evaluation streams depth-by-depth as the engine thinks
- **ELO tracking** — your rating updates after every game using the standard K-factor formula
- **Opening Trainer** — drill opening lines with move popularity and win rates from Lichess *(coming Phase 8)*
- **Puzzles** — tactical puzzles sourced from Lichess, filtered by theme and rating *(coming Phase 8)*
- **LLM commentary** — ask Claude to explain any position, move quality, and what to think about next *(coming Phase 7)*
- **Profile** — ELO chart, win/loss history, and game-by-game breakdown

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Chess UI | `react-chessboard`, `chess.js` |
| Routing | `react-router-dom` v6 |
| Charts | `recharts` |
| Backend | Python 3.12, FastAPI |
| Chess Engine | Stockfish 18 via `python-chess` (UCI) |
| Realtime | WebSockets (FastAPI native) |
| LLM | Anthropic Claude API |
| Database | SQLite via SQLAlchemy |
| Opening Book | Lichess Opening Explorer API |
| Puzzles | Lichess Puzzles API |

---

## Architecture

```
chess_app/
├── frontend/                  # React + Vite app
│   └── src/
│       ├── pages/
│       │   ├── Play.tsx           # Play vs bot page
│       │   ├── Profile.tsx        # ELO chart + game history
│       │   └── learn/
│       │       ├── Openings.tsx   # Opening trainer
│       │       └── Puzzles.tsx    # Tactical puzzles
│       ├── components/
│       │   ├── Layout.tsx         # Sidebar nav shell
│       │   ├── Board.tsx          # react-chessboard wrapper
│       │   ├── EvalBar.tsx        # Live centipawn eval bar
│       │   ├── MoveHistory.tsx    # PGN move list
│       │   ├── SidePanel.tsx      # Status, moves, LLM panel
│       │   └── EloTracker.tsx     # ELO line chart
│       ├── hooks/
│       │   ├── useChessGame.ts    # chess.js state management
│       │   └── useWebSocket.ts    # Engine stream WS connection
│       ├── api/
│       │   └── client.ts          # Typed REST client
│       └── types/
│           └── chess.ts           # Shared TypeScript types
│
├── backend/                   # FastAPI app
│   ├── main.py                # App init, lifespan, routers
│   ├── config.py              # Settings from .env
│   ├── database.py            # SQLAlchemy engine + session
│   ├── store.py               # In-memory game state
│   ├── models/
│   │   ├── user.py            # User ORM model (ELO)
│   │   └── game.py            # Game ORM model (PGN, result, ELO)
│   ├── routers/
│   │   ├── game.py            # POST /game/new, POST /game/{id}/move
│   │   └── elo.py             # GET /elo/current, GET /elo/history
│   ├── services/
│   │   ├── stockfish.py       # Stockfish UCI wrapper (async singleton)
│   │   └── elo.py             # ELO delta calculation (K=32)
│   └── ws/
│       └── engine_stream.py   # WS /ws/engine/{id} — streams eval depths
│
└── data/
    └── chess_app.db           # SQLite database (gitignored)
```

---

## Data Flow

### Making a move

```
Player drags piece
  → chess.js validates locally (instant)
  → POST /game/{id}/move { from, to }
      → python-chess validates
      → Stockfish picks best move (time-limited, ELO-capped)
      → ELO updated in DB if game over
      → returns { player_move, engine_move, fen, game_over, elo_delta }
  ← frontend applies engine move to board

Simultaneously:
  → WS /ws/engine/{id} receives { type: "analyze", fen }
      → Stockfish streams depth 1..18 evals to queue
      → WS forwards each depth update to client
  ← eval bar animates live
```

### Engine singleton

Stockfish runs as a single persistent async process shared across all requests. An `asyncio.Lock` serialises access so `play()` and `analysis()` never run concurrently. Engine strength is set via `UCI_LimitStrength` + `UCI_Elo` at startup and is locked for the duration of a game.

### ELO formula

```
expected = 1 / (1 + 10^((opponent_elo - player_elo) / 400))
new_elo  = player_elo + 32 * (result - expected)

result: 1.0 = win, 0.5 = draw, 0.0 = loss
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- Stockfish (`brew install stockfish` on macOS)

### Install

```bash
make install
```

### Run

```bash
make dev
```

Opens at `http://localhost:5173`. Backend API at `http://localhost:8000`.

### Environment

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
ANTHROPIC_API_KEY=your_key_here
STOCKFISH_PATH=/usr/local/bin/stockfish
STOCKFISH_MOVE_TIME=0.5
STOCKFISH_ELO_LIMIT=1500
```

---

## Build Plan

| Phase | Status |
|---|---|
| 1 — Project Scaffold | ✅ Done |
| 2 — Playable Chess Board | ✅ Done |
| 3 — Stockfish Integration | ✅ Done |
| 4 — Game Persistence + ELO Tracking | ✅ Done |
| 5 — App Pages + Navigation | ✅ Done |
| 6 — Polish + UX | 🔄 Next |
| 7 — LLM Commentary | ⬜ Planned |
| 8 — Opening Trainer + Puzzles | ⬜ Planned |
| 9 — Deployment | ⬜ Planned |
