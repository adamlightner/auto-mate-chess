# AutoMate

## Project Overview

An interactive chess web app for practicing and growing ELO rating. Uses Stockfish for move analysis and opening training, with an LLM-powered side panel that explains moves, tactics, and strategy in real time.

---

## Branding

### Color Palette

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Brand Dark | `#534AB7` | `brand-dark` | Buttons, strong accents |
| Brand (mid) | `#7F77DD` | `brand` | Progress bars, avatar backgrounds |
| Brand Light | `#AFA9EC` | `brand-light` | Icon accents, labels, links |
| Brand Lighter | `#CECBF6` | `brand-lighter` | Hover states on links |

All four shades are registered in `tailwind.config.ts` under `theme.extend.colors.brand`. Always use the brand tokens — never raw `purple-*` Tailwind classes — so the palette stays consistent with the logo.

### Logo Assets (`frontend/public/`)

| File | Use |
|---|---|
| `automate-wordmark.svg` | Sidebar (expanded state) |
| `automate-logo-horizontal.svg` | Home page hero |
| `automate-logo-primary.svg` | General / fallback |
| `automate-favicon.svg` | Browser tab |
| `automate-icon-512.svg` | App icon / PWA |
| `automate-mono-dark.svg` | Dark mono variant |
| `automate-mono-light.svg` | Light mono variant |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Chess UI | `react-chessboard`, `chess.js` |
| Backend | Python, FastAPI |
| Chess Engine | Stockfish (via `python-chess` UCI) |
| LLM | Anthropic Claude API (called from backend) |
| Realtime | WebSockets (FastAPI native) |
| Storage | SQLite via SQLAlchemy (game history, ELO, openings progress) |
| Opening Book | Lichess Opening Explorer API (no auth required) |

---

## Project Structure

```
chess_app/
├── CLAUDE.md                  # This file
│
├── frontend/                  # React + Vite app
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── main.tsx           # App entry point
│       ├── App.tsx            # Root component, routing
│       ├── components/
│       │   ├── Board.tsx          # react-chessboard wrapper, drag/drop moves
│       │   ├── SidePanel.tsx      # LLM commentary + engine eval display
│       │   ├── EvalBar.tsx        # Stockfish centipawn eval bar
│       │   ├── MoveHistory.tsx    # Scrollable PGN move list
│       │   ├── OpeningTrainer.tsx # Opening drill mode UI
│       │   └── EloTracker.tsx     # ELO history chart
│       ├── hooks/
│       │   ├── useChessGame.ts    # Core game state (chess.js instance, FEN)
│       │   ├── useWebSocket.ts    # WS connection to backend engine stream
│       │   └── useAnalysis.ts     # Trigger analysis, receive LLM + eval
│       ├── api/
│       │   └── client.ts          # Typed REST + WS client functions
│       └── types/
│           └── chess.ts           # Shared TS types (Move, GameResult, etc.)
│
├── backend/                   # FastAPI app
│   ├── main.py                # FastAPI app init, router registration
│   ├── requirements.txt
│   ├── .env.example           # ANTHROPIC_API_KEY, STOCKFISH_PATH, etc.
│   ├── config.py              # Settings loaded from .env
│   ├── database.py            # SQLAlchemy setup, SQLite connection
│   ├── models/
│   │   ├── game.py            # Game ORM model (pgn, elo_delta, result)
│   │   ├── user.py            # User ORM model (elo, prefs)
│   │   └── opening.py         # Opening progress ORM model
│   ├── routers/
│   │   ├── game.py            # POST /game/new, GET /game/{id}, POST /game/{id}/move
│   │   ├── analysis.py        # POST /analysis — one-shot position analysis
│   │   ├── openings.py        # GET /openings, POST /openings/drill
│   │   └── elo.py             # GET /elo/history
│   ├── services/
│   │   ├── stockfish.py       # Stockfish subprocess wrapper (asyncio.to_thread)
│   │   ├── llm.py             # Claude API calls — explains moves, tactics
│   │   └── opening_book.py    # Lichess Opening Explorer API (masters + lichess endpoints)
│   └── ws/
│       └── engine_stream.py   # WebSocket endpoint — streams Stockfish depth updates
│
└── data/
    └── chess_app.db           # SQLite database (gitignored)
```

---

## Core Features

### 1. Play vs Stockfish
- Adjustable engine difficulty (ELO cap / depth limit)
- After each move: Stockfish eval + LLM commentary in side panel
- ELO rating updates after each game (simple Glicko-style delta)

### 2. Opening Trainer
- Select an opening (e.g. Sicilian Najdorf, Queen's Gambit)
- Board drills correct move sequence; highlights deviations
- LLM explains the purpose of each move in the opening

### 3. Real-time Engine Stream (WebSocket)
- After player move, WS streams Stockfish analysis depth-by-depth
- Frontend shows live centipawn eval bar updating as engine thinks
- Final depth triggers LLM call for natural-language explanation

### 4. ELO Tracker
- Persistent ELO stored in SQLite
- Line chart of ELO over time
- Breakdown by color (white/black) and opening family

---

## Data Flow

```
User makes move
  → frontend validates with chess.js
  → POST /game/{id}/move  (FEN + move)
      → backend validates with python-chess
      → Stockfish analysis (asyncio.to_thread)
      → Claude API: explain the position + move quality
      → return: { eval, best_move, explanation }
  ← frontend updates board, eval bar, side panel

Simultaneously:
  → WS /ws/engine/{game_id}
      → streams depth 1..N eval updates
  ← frontend updates eval bar in real time
```

---

## Key Design Decisions

- **Stockfish runs in thread pool** (`asyncio.to_thread`) to avoid blocking the FastAPI event loop
- **LLM called server-side** — API key never exposed to the browser
- **LLM commentary is on-demand** — triggered by a button press, not automatic after every move
- **chess.js on frontend** for instant move validation before hitting the backend (no round-trip for illegal moves)
- **SQLite for now** — straightforward to swap for Postgres later if needed
- **Single user assumed initially** — no auth system in v1, user_id = 1 hardcoded
- **ELO tracking uses simple delta system** — not full Glicko-2
- **Engine strength capped by ELO limit** (`STOCKFISH_ELO_LIMIT`) for human-like play, not depth limit

---

## Environment Variables (backend/.env)

```
ANTHROPIC_API_KEY=
STOCKFISH_PATH=/usr/local/bin/stockfish   # or /opt/homebrew/bin/stockfish on Apple Silicon
DATABASE_URL=sqlite:///./data/chess_app.db
STOCKFISH_DEPTH=18
STOCKFISH_ELO_LIMIT=1500                  # cap engine strength for practice
```

---

## Development Setup (planned)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev        # Vite dev server on :5173, proxies /api → :8000
```

---

## Out of Scope (v1)

- User authentication / accounts
- Multiplayer (human vs human)
- Puzzle trainer (separate from opening trainer)
- Mobile-specific layout
- Automatic LLM commentary (on-demand only via button)
