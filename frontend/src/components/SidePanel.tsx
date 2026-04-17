import { useState } from 'react'
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

const COLOR_OPTIONS: { value: 'white' | 'black' | 'random'; label: string; icon: string }[] = [
  { value: 'white', label: 'White', icon: '♔' },
  { value: 'black', label: 'Black', icon: '♚' },
  { value: 'random', label: 'Random', icon: '?' },
]

interface SidePanelProps {
  gameId: string | null
  history: MoveHistoryEntry[]
  gameOver: string | null
  turn: Color
  isEngineTurn: boolean
  eloDelta: number | null
  currentElo: number
  engineElo: number
  playerColor: 'white' | 'black' | 'random'
  totalHalfMoves: number
  viewIndex: number
  isLive: boolean
  canUndo: boolean
  showClassifications: boolean
  onEloChange: (elo: number) => void
  onColorChange: (color: 'white' | 'black' | 'random') => void
  onStart: () => void
  onGoFirst: () => void
  onGoPrev: () => void
  onGoNext: () => void
  onGoLast: () => void
  onUndo: () => void
  onResign: () => void
  onToggleClassifications: () => void
}

export default function SidePanel({
  gameId,
  history,
  gameOver,
  isEngineTurn,
  engineElo,
  playerColor,
  totalHalfMoves,
  viewIndex,
  isLive,
  canUndo,
  showClassifications,
  onEloChange,
  onColorChange,
  onStart,
  onGoFirst,
  onGoPrev,
  onGoNext,
  onGoLast,
  onUndo,
  onResign,
  onToggleClassifications,
}: SidePanelProps) {
  const [confirmResign, setConfirmResign] = useState(false)

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
      {/* Color selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Play as</label>
        <div className="flex gap-1.5">
          {COLOR_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => onColorChange(value)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                playerColor === value
                  ? 'border-brand bg-brand/20 text-white'
                  : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ELO selection */}
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
          <MoveHistory history={[]} showClassifications={false} />
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

        {confirmResign ? (
          <div className="flex-1 flex gap-1">
            <button
              onClick={() => {
                setConfirmResign(false)
                onResign()
              }}
              className="flex-1 py-2 rounded bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmResign(false)}
              className="flex-1 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmResign(true)}
            disabled={!!gameOver || isEngineTurn || totalHalfMoves === 0}
            className="flex-1 py-2 rounded bg-gray-700 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            Resign
          </button>
        )}
      </div>

      {/* Status — engine thinking */}
      {isEngineTurn && !gameOver && (
        <div className="bg-gray-800 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-400">Engine thinking…</span>
        </div>
      )}

      {/* After game ends — setup for next game */}
      {gameOver && setupPanel}

      {/* Move history */}
      <div className="bg-gray-800 rounded-lg p-3 overflow-y-auto flex-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Moves</h2>
          <button
            onClick={onToggleClassifications}
            title={showClassifications ? 'Hide move classifications' : 'Show move classifications'}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              showClassifications
                ? 'border-brand bg-brand/20 text-brand-light'
                : 'border-gray-600 text-gray-500 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            Review
          </button>
        </div>
        <MoveHistory history={history} showClassifications={showClassifications} />
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
