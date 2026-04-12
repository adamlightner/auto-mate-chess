import MoveHistory from './MoveHistory'
import type { Color, MoveHistoryEntry } from '../types/chess'

const ELO_OPTIONS = [1320, 1400, 1500, 1600, 1800, 2000, 2200, 2500, 2800, 3190]

function eloLabel(elo: number) {
  if (elo <= 1400) return 'Beginner — good for learning basics'
  if (elo <= 1600) return 'Intermediate — solid club-level play'
  if (elo <= 2000) return 'Advanced — strong positional understanding'
  if (elo <= 2500) return 'Expert — near master-level strength'
  return 'Maximum — full engine strength'
}

interface SidePanelProps {
  gameId: string | null
  history: MoveHistoryEntry[]
  gameOver: string | null
  turn: Color
  isEngineTurn: boolean
  eloDelta: number | null
  currentElo: number
  engineElo: number
  totalHalfMoves: number
  viewIndex: number
  isLive: boolean
  canUndo: boolean
  onEloChange: (elo: number) => void
  onStart: () => void
  onGoFirst: () => void
  onGoPrev: () => void
  onGoNext: () => void
  onGoLast: () => void
  onUndo: () => void
  onResign: () => void
}

export default function SidePanel({
  gameId,
  history,
  gameOver,
  isEngineTurn,
  eloDelta,
  currentElo,
  engineElo,
  totalHalfMoves,
  viewIndex,
  isLive,
  canUndo,
  onEloChange,
  onStart,
  onGoFirst,
  onGoPrev,
  onGoNext,
  onGoLast,
  onUndo,
  onResign,
}: SidePanelProps) {
  const deltaColor = eloDelta == null ? '' : eloDelta > 0 ? 'text-green-400' : eloDelta < 0 ? 'text-red-400' : 'text-yellow-400'
  const deltaLabel = eloDelta == null ? null : `${eloDelta > 0 ? '+' : ''}${eloDelta}`

  const navBtn = (label: string, onClick: () => void, disabled: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-mono transition-colors"
    >
      {label}
    </button>
  )

  // ── Setup panel (before first game, or after game ends) ──────────────────────
  const setupPanel = (
    <div className="bg-gray-800 border border-brand/30 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Engine ELO
        </label>
        <select
          value={engineElo}
          onChange={(e) => onEloChange(Number(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand"
        >
          {ELO_OPTIONS.map((elo) => (
            <option key={elo} value={elo}>{elo}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">{eloLabel(engineElo)}</p>
      </div>
      <button
        onClick={onStart}
        className="w-full py-2.5 rounded-lg bg-brand-dark hover:bg-brand text-white text-sm font-semibold transition-colors"
      >
        {gameOver ? 'New Game' : 'Start Game'}
      </button>
    </div>
  )

  // ── Before first game ────────────────────────────────────────────────────────
  if (!gameId) {
    return (
      <div className="flex flex-col gap-3 h-full">
        {setupPanel}
        <div className="bg-gray-800 rounded-lg p-3 overflow-y-auto flex-1 opacity-40 pointer-events-none">
          <MoveHistory history={[]} />
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col flex-1 opacity-40">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Analysis</p>
          <p className="text-gray-500 text-sm italic">Press "Explain" after a move to get commentary.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Move navigation */}
      <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex gap-1.5">
          {navBtn('⟨⟨', onGoFirst, viewIndex === 0)}
          {navBtn('⟨',  onGoPrev,  viewIndex === 0)}
          {navBtn('⟩',  onGoNext,  isLive)}
          {navBtn('⟩⟩', onGoLast,  isLive)}
        </div>
        {!isLive && (
          <p className="text-xs text-center text-yellow-400">
            Reviewing move {viewIndex} of {totalHalfMoves}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          Undo
        </button>
        <button
          onClick={onResign}
          disabled={!!gameOver || isEngineTurn || totalHalfMoves === 0}
          className="flex-1 py-2 rounded bg-gray-700 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          Resign
        </button>
      </div>

      {/* Status — engine thinking */}
      {isEngineTurn && !gameOver && (
        <div className="bg-gray-800 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-400">Engine thinking…</span>
        </div>
      )}

      {/* Game over — result + new game setup */}
      {gameOver && (
        <div className="flex flex-col gap-3">
          <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-yellow-400 font-semibold capitalize">
              {gameOver.replace(/_/g, ' ')}
            </span>
            {deltaLabel && (
              <span className="text-xs font-semibold text-gray-400">
                {currentElo} <span className={deltaColor}>{deltaLabel}</span>
              </span>
            )}
          </div>
          {setupPanel}
        </div>
      )}

      {/* Move history */}
      <div className="bg-gray-800 rounded-lg p-3 overflow-y-auto flex-1">
        <MoveHistory history={history} />
      </div>

      {/* Analysis */}
      <div className="bg-gray-800 rounded-lg p-3 flex flex-col flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Analysis</p>
        <p className="text-gray-500 text-sm italic flex-1">Press "Explain" after a move to get commentary.</p>
        <button
          disabled
          className="mt-3 w-full py-1.5 rounded bg-brand-dark text-white text-sm font-medium opacity-40 cursor-not-allowed"
        >
          Explain this position
        </button>
      </div>

      {/* New game — subtle footer button (only when game active, not over) */}
      {!gameOver && (
        <button
          onClick={onStart}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          + New Game
        </button>
      )}

    </div>
  )
}
