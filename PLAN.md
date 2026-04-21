# Chess App — Build Plan

Iterative milestones from scaffold to production. Each phase ends with something playable or demonstrable so you can learn and give feedback before moving on.

---

## Phase 1 — Project Scaffold ✓
**Goal:** Runnable skeleton with no real functionality yet. Just wiring.

- [x] Scaffold `frontend/` — Vite + React + TypeScript + Tailwind
- [x] Scaffold `backend/` — FastAPI with health check endpoint
- [x] Install and verify core dependencies (`chess.js`, `react-chessboard`, `python-chess`)
- [x] Verify Stockfish is installed and reachable from backend
- [x] Frontend proxies `/api` to backend in Vite config
- [x] `backend/.env.example` with all required variables

---

## Phase 2 — Playable Chess Board ✓
**Goal:** A working chess board in the browser. No engine yet.

- [x] `Board.tsx` — renders `react-chessboard`, handles drag/drop moves
- [x] `useChessGame.ts` — manages `chess.js` instance, FEN state, move history
- [x] `MoveHistory.tsx` — displays moves in PGN notation as you play
- [x] Frontend validates moves client-side with `chess.js` (illegal moves rejected instantly)
- [x] Basic two-player local play (pass-and-play) to verify board works
- [x] Minimal Tailwind layout: board left, side panel right

---

## Phase 3 — Stockfish Integration ✓
**Goal:** Play against the engine. See it think.

- [x] `services/stockfish.py` — wraps Stockfish via `python-chess` UCI, runs in thread pool
- [x] `routers/game.py` — `POST /game/new`, `POST /game/{id}/move` (returns engine reply)
- [x] `ws/engine_stream.py` — WebSocket streams depth-by-depth eval updates
- [x] `useWebSocket.ts` — connects to engine stream
- [x] `EvalBar.tsx` — centipawn eval bar, updates live as engine thinks
- [x] Player plays white, Stockfish replies as black
- [x] Engine strength controlled by `STOCKFISH_ELO_LIMIT` env var

---

## Phase 4 — Game Persistence + ELO Tracking ✓
**Goal:** Games are saved, your rating changes over time.

- [x] `database.py` — SQLAlchemy + SQLite setup
- [x] `models/game.py`, `models/user.py` — ORM models
- [x] Save game PGN + result to DB after each game
- [x] ELO delta calculated after each game (simple formula vs engine ELO)
- [x] `routers/elo.py` — `GET /elo/history`
- [x] `EloTracker.tsx` — line chart of ELO over time

---

## Phase 5 — App Pages + Navigation ✓
**Goal:** Establish the full navigation structure. Every page exists with its layout and placeholder content.

### Structure

```
Nav: [ Home ]  [ Play ]  [ Study ]  [ Practice ]  [ Puzzles ]  [ Profile ]
```

| Section | Route | Purpose |
|---|---|---|
| **Home** | `/home` | Dashboard — stats, recent games, quick-start |
| **Play** | `/play` | Play vs Stockfish |
| **Study** | `/study/openings` | Passive learning — browse openings, read, step through lines |
| **Study** | `/study/middlegame` | Middlegame concepts — read and explore |
| **Study** | `/study/endgame` | Endgame concepts — read and explore |
| **Practice** | `/practice/openings` | Interactive opening drills — move pieces, get feedback |
| **Practice** | `/practice/endgames` | Endgame technique drills |
| **Practice** | `/practice/patterns` | Pattern recognition drills |
| **Puzzles** | `/puzzles` | Tactical puzzles by theme and rating |
| **Profile** | `/profile` | ELO chart, stats, game history, settings |

### Tasks

- [x] Install `react-router-dom`, set up routes in `main.tsx`
- [x] `Layout.tsx` — shared shell with sidebar nav
- [x] Nav shows active section with icons and labels
- [x] `pages/Play.tsx` — board + side panel
- [x] `pages/study/Openings.tsx` — opening explorer (browse, step through lines)
- [x] `pages/study/MiddleGame.tsx` — placeholder
- [x] `pages/study/EndGame.tsx` — placeholder
- [ ] Rename `/learn/*` routes → `/study/*` in router and nav
- [ ] Add **Practice** section to sidebar nav (below Study)
- [ ] `pages/practice/Openings.tsx` — placeholder (interactive drill shell)
- [ ] `pages/practice/Endgames.tsx` — placeholder
- [ ] `pages/practice/Patterns.tsx` — placeholder
- [x] `pages/Puzzles.tsx` — placeholder
- [x] `pages/Profile.tsx` — ELO chart + stats + game history
- [x] Redirect `/` → `/home`

**Done when:** All pages are reachable via the nav, each has its layout, and the Play page still works end-to-end.

---

## Phase 6 — Home Page ✓
**Goal:** A landing page that orients new users and gives returning users a quick snapshot.

- [x] `/home` route added to sidebar nav
- [x] Hero section with player stats
- [x] Quick stats strip — ELO, games played, win rate
- [x] Recent games list
- [x] Navigation cards — Play, Study, Practice, Puzzles
- [x] Redirect `/` → `/home`

---

## Phase 7 — Polish + UX
**Goal:** Each section of the app feels complete and intentional.

### Sidebar
- [x] Active nav state is visually clear
- [x] Sidebar collapses to icon-only
- [x] Icons for all nav items
- [x] Profile pinned to bottom
- [ ] Update sidebar to reflect new Study / Practice split (rename Learn → Study, add Practice)

### Home
- [x] Profile tile with player stats
- [x] Start/continue learning tile with progress bar
- [x] Recent games at bottom
- [x] Clean icon color scheme

### Play
- [x] ELO difficulty selector
- [x] New game modal
- [x] Resign + Undo buttons
- [x] Move navigation
- [x] Last move highlight + legal move hints
- [x] Board orientation flip
- [x] Captured pieces display
- [x] Sound effects
- [x] Promotion picker
- [x] Game over modal with ELO delta

### Study → Openings
- [x] Opening explorer — browse by color and strategy (1.e4 / 1.d4 / vs 1.e4 / vs 1.d4)
- [x] Title banner with opening name, level badges, description
- [x] Board stepping through main line with move tokens
- [x] Variations & Gambits panel (bottom)
- [x] Key Ideas / Plans / Tactics panel (right)
- [ ] Board centering fix (in progress)

### Study → Middle Game
- [ ] UI polish pass (Phase 9)

### Study → End Game
- [ ] UI polish pass (Phase 9)

### Puzzles
- [ ] UI polish pass (Phase 9)

### Profile
- [ ] ELO chart styling — axis labels, grid lines, hover tooltips
- [ ] Win/loss/draw bar animation
- [ ] Game history — click a row to replay on a board
- [ ] Piece style picker

**Done when:** Every page feels deliberate and finished. No rough edges in sections already built.

**Status:** Sidebar ✓ · Home ✓ · Play ✓ · Study/Openings (in progress) · Profile (pending) · Practice (Phase 9)

---

## Phase 8 — LLM Commentary
**Goal:** Ask for an explanation of any position, get a useful answer.

- [ ] `services/llm.py` — Claude API call with position context (FEN, last move, eval, color to move)
- [ ] `routers/analysis.py` — `POST /analysis` accepts FEN + move, returns explanation
- [ ] LLM panel in Play page — "Explain this position" button, response in side panel
- [ ] Prompt engineering: move quality, tactical themes, what to watch for next
- [ ] Loading state while waiting for response

**Done when:** You can press a button on any board position and get a clear, useful explanation.

---

## Phase 9 — Study: All Sections
**Goal:** All Study sections are fully browsable with rich content.

**Opening (`/study/openings`):**
- [ ] Full annotated opening data — descriptions, key ideas, plans, tactics for all lines
- [ ] Move popularity % and win rates from Lichess Opening Explorer API
- [ ] LLM explains the purpose of each move when asked

**Middle Game (`/study/middlegame`):**
- [ ] Curated positions illustrating key concepts (pawn structure, piece activity, etc.)
- [ ] Board stepping through illustrative lines
- [ ] LLM explains why a plan is correct in context

**End Game (`/study/endgame`):**
- [ ] Curated theoretical positions per topic (K+P, rook endings, etc.)
- [ ] Board stepping through technique
- [ ] LLM explains key concepts (opposition, Lucena, etc.)

**Done when:** All three Study sections have real content and feel like a reference resource.

---

## Phase 10 — Practice: Opening Drills
**Goal:** Interactive opening practice with move trees, hints, and commentary.

### Data Architecture

Opening content lives in JSON files (version-controlled, bundled at build time), not the database. Player progress lives in SQLite.

```
frontend/src/data/openings/
  italian-game.json       ← move tree + annotations
  ruy-lopez.json
  sicilian-najdorf.json
  ...
```

Each JSON file contains a **move tree** — a branching structure where every node is a position and edges are moves with annotations:

```ts
interface MoveNode {
  san: string
  uci: string
  fen: string
  annotation?: {
    comment: string          // "This controls the center and develops with tempo"
    quality?: '!!' | '!' | '!?' | '?!' | '?' | '??'
    arrows?: Arrow[]         // show ideas from this position
    highlights?: Square[]
  }
  children: MoveNode[]       // mainline is children[0], alternatives are children[1+]
  isMainline: boolean
  hints?: {                  // escalating hints on request
    0: string                // vague: "Think about development"
    1: Arrow[]               // directional: arrow to target square
    2: string                // full: "Nf3 attacks e5 and develops the knight"
  }
}
```

### Backend

- [ ] `models/practice_session.py` — tracks which lines were drilled, success rate, timestamp
- [ ] `routers/practice.py` — `POST /practice/opening/record` (log a drill attempt)
- [ ] `GET /practice/opening/progress` — return stats per opening for the Practice home and Profile

### Frontend

- [ ] `/practice/openings` — opening picker (same left nav as Study, but links to drill mode)
- [ ] `PracticeBoard.tsx` — interactive board that checks moves against the move tree
  - Player drags pieces; move is validated against tree children
  - Mainline match → positive feedback, show annotation comment, advance
  - Known sideline match → "Good try — the main line is..." + explain difference
  - Unknown move → offer escalating hint (vague → arrow → full explanation)
  - Hint button surfaces hints at increasing specificity
- [ ] Progress indicators — moves completed, accuracy %, lines mastered
- [ ] Streak / rep count — track how many times each line has been drilled correctly

**Done when:** You can select the Italian Game, play it out move by move against the tree, receive commentary on each move, request hints when stuck, and see your progress tracked over sessions.

---

## Phase 11 — Practice: Endgames + Patterns
**Goal:** Extend the practice framework to endgame positions and tactical patterns.

- [ ] `/practice/endgames` — standard endgame positions as move trees (K+P vs K, Lucena, Philidor, etc.)
- [ ] `/practice/patterns` — pattern recognition drills (forks, pins, skewers, back-rank mates)
- [ ] Shared `PracticeBoard` component handles all drill types
- [ ] Progress tracked per category in SQLite

---

## Phase 12 — Puzzles (Full)
**Goal:** Tactical puzzle trainer with rating tracking.

- [ ] `services/puzzles.py` — Lichess Puzzles API (filter by theme + rating)
- [ ] `routers/puzzles.py` — `GET /puzzles/next` by rating range + theme
- [ ] Puzzle board — find the winning line
- [ ] LLM explains why the solution works when asked
- [ ] Puzzle rating tracked separately from game ELO

---

## Phase 13 — Deployment
**Goal:** Accessible from anywhere, not just localhost.

- [ ] `backend/Dockerfile` — includes Stockfish binary install
- [ ] Choose hosting (Fly.io / Render / VPS — TBD)
- [ ] Frontend build + static file serving
- [ ] Environment variable config for production
- [ ] Basic rate limiting on LLM endpoint
- [ ] CORS config locked down

**Done when:** App is live at a URL, games and ELO persist between sessions.

---

## Current Phase
**→ Phase 7 — Polish + UX** (Study/Openings board centering, Profile section, then nav restructure for Study/Practice split)
