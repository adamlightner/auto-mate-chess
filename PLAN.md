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

## Phase 5 — App Pages + Navigation
**Goal:** Establish the three-section structure. Every page exists with its layout and placeholder content before any gets its full feature set.

### Structure

```
Nav: [ Play ]  [ Learn ]  [ Profile ]
```

| Section | Route | Pages |
|---|---|---|
| **Play** | `/play` | Play vs Bot — choose engine rating, play game |
| **Learn** | `/learn/openings` | Opening Trainer — drill opening lines |
| **Learn** | `/learn/puzzles` | Puzzles — tactical puzzles by theme/rating |
| **Profile** | `/profile` | ELO chart, stats, win/loss, game history |

### Tasks

- [x] Install `react-router-dom`, set up routes in `main.tsx`
- [x] `Layout.tsx` — shared shell with top nav: Play / Learn / Profile
- [x] Nav shows active section, Learn has a dropdown for Openings and Puzzles
- [x] `pages/Play.tsx` — move existing board + side panel here
- [x] `pages/learn/Openings.tsx` — placeholder: board + opening picker stub
- [x] `pages/learn/Puzzles.tsx` — placeholder: puzzle board stub
- [x] `pages/Profile.tsx` — ELO chart + stats (win %, games played, best win) + game history table
- [x] `/elo/history` reused for game history table (covers this need)
- [x] Redirect `/` → `/play`

**Done when:** All pages are reachable via the nav, each has its layout and real or placeholder content, and the Play page still works end-to-end.

---

## Phase 6 — Home Page
**Goal:** A landing page that orients new users and gives returning users a quick snapshot of their progress.

- [x] `/home` route added to sidebar nav (first item)
- [x] Hero section — app name, tagline, "Start Playing" CTA button
- [x] Quick stats strip — current ELO, games played, win rate (pulled from existing `/elo` endpoints)
- [x] Recent games list — last 5 games with result, ELO delta, opponent strength
- [ ] "Continue" shortcut — if a game was in progress (future: session persistence), resume it
- [x] Navigation cards — Play, Learn (Openings + Puzzles), Profile with short descriptions
- [x] Redirect `/` → `/home`

**Done when:** A new user lands here and immediately understands what the app does and where to go. A returning user sees their progress at a glance.

---

## Phase 7 — Polish + UX
**Goal:** Each section of the app feels complete and intentional. Work through the nav sections one at a time.

### Sidebar
- [x] Active nav state is visually clear
- [x] Sidebar collapses to icon-only on smaller screens
- [x] Add icons to sidebar nav items
- [x] Increase font size and make nav labels bold
- [x] Move Profile to bottom of sidebar as a persistent icon/link


### Home
- [x] Remove 'Start Playing' in the top banner. 
- [x] Add profile tile to the right of title banner with player stats. Empty state for brand-new users (no games yet)
- [x] In row 2, create a start/continue learning that will have a progress bar, current/next chapter, etc. This can be template data for now.
- [x] Move recent games to the very bottom. 
- [x] Clean up icons in shortcut tiles to use the same color scheme. 

### Play
- [x] ELO difficulty selector — set engine strength before starting (locked per game)
- [x] New game modal — shown on load and after each game ends
- [x] Resign button
- [x] Undo button (reverts last full move pair)
- [x] Move navigation — step through game history without leaving the board
- [x] Last move highlight + legal move hints
- [x] Board orientation flip — play as black
- [x] Captured pieces display — show material balance above/below board
- [x] Sound effects — move, capture, check, game over
- [x] Promotion picker — UI to choose promotion piece (currently auto-queens)
- [x] Game over summary — result + ELO delta shown clearly in modal

### Game Flow
- [x] Game-end modal (checkmate, stalemate, resignation, draw) — appears over the board when the game concludes
  - Shows result clearly (e.g. "Checkmate — You Win" / "You Lost" / "Draw")
  - Shows ELO delta (+12 / -8)
  - **Review** — closes modal, enables move navigation so the user can step through the game
  - **Rematch** — starts a new game at the same ELO immediately, no new-game modal
  - **New Bot** — opens the new-game modal so the user can pick a different ELO
- [x] Resign confirmation — small inline confirm step before resigning (prevent accidental clicks)
- [x] Stalemate / draw detection surfaced clearly (currently lumped with game-over)

### Learn → Openings
- [ ] Opening trainer difficulty — separate ELO setting independent of game ELO
- [ ] UI polish pass once feature is built (Phase 9)

### Learn → Middle Game
- [ ] UI polish pass once feature is built (Phase 9)

### Learn → End Game
- [ ] UI polish pass once feature is built (Phase 9)

### Learn → Puzzles
- [ ] UI polish pass once feature is built (Phase 9)

### Profile
- [ ] ELO chart styling — axis labels, grid lines, hover tooltips
- [ ] Win/loss/draw bar animation
- [ ] Game history — click a row to replay the game on a board
- [ ] Piece style picker — visual selector for board piece set

**Done when:** Every page feels deliberate and finished, not placeholder. No rough edges in the sections that are already built.

**Status:** Sidebar ✓ · Home ✓ · Play ✓ · Game Flow ✓ · Profile (pending below) · Learn (deferred to Phase 9)

---

## Phase 8 — LLM Commentary
**Goal:** Ask for an explanation of any position, get a useful answer.

- [ ] `services/llm.py` — Claude API call with position context (FEN, last move, eval, color to move)
- [ ] `routers/analysis.py` — `POST /analysis` accepts FEN + move, returns explanation
- [ ] LLM panel in Play page — "Explain this position" button, response displayed in side panel
- [ ] LLM panel in Analysis page — explain any position from a loaded game or FEN
- [ ] Prompt engineering: move quality, tactical themes, what to watch for next
- [ ] Loading state while waiting for LLM response

**Done when:** You can press a button on any board position and get a clear, useful explanation.

---

## Phase 9 — Learn: All Four Sections
**Goal:** All four Learn sections are fully functional with LLM guidance.

**Opening (`/learn/openings`):**
- [ ] `services/opening_book.py` — Lichess Opening Explorer API (masters + lichess endpoints, win rates, popularity)
- [ ] `routers/openings.py` — `GET /openings` (list), `POST /openings/drill` (check move against book)
- [ ] `models/opening.py` — track progress per opening
- [ ] Select opening, drill mode, highlights correct/incorrect moves
- [ ] LLM explains the purpose of each opening move when asked
- [ ] Show move popularity % and win rates from Lichess data

**Middle Game (`/learn/middle-game`):**
- [ ] Curated positions illustrating each concept (pawn structure, piece activity, etc.)
- [ ] Interactive board — find the best move or plan
- [ ] LLM explains why a move or plan is correct in context
- [ ] Progress tracking per topic

**End Game (`/learn/end-game`):**
- [ ] Curated theoretical positions for each topic (K+P, rook endings, etc.)
- [ ] Interactive board — player must find the winning technique
- [ ] LLM explains the key concept (opposition, Lucena, etc.)
- [ ] Progress tracking per topic

**Puzzles (`/learn/puzzles`):**
- [ ] `services/puzzles.py` — Lichess Puzzles API (free, no auth, filter by theme + rating)
- [ ] `routers/puzzles.py` — `GET /puzzles/next` returns a puzzle by rating range + theme
- [ ] Puzzle board — shows position, player must find the winning line
- [ ] LLM explains why the solution works when asked
- [ ] Track puzzles solved + rating

**Done when:** You can work through any of the four sections, interact with positions, and ask the LLM to explain any concept.

---

## Phase 10 — Deployment
**Goal:** Accessible from anywhere, not just localhost.

- [ ] `backend/Dockerfile` — includes Stockfish binary install
- [ ] Choose hosting (Fly.io / Render / VPS — TBD)
- [ ] Frontend build + static file serving (Nginx or CDN)
- [ ] Environment variable config for production
- [ ] Basic rate limiting on LLM endpoint
- [ ] CORS config locked down

**Done when:** App is live at a URL, games and ELO persist between sessions.

---

## Current Phase
**→ Phase 7 — Polish + UX** (Profile section remaining, then Phase 8)
