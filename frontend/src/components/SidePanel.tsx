import MoveHistory from './MoveHistory'
import type { Color, MoveHistoryEntry } from '../types/chess'

interface SidePanelProps {
  history: MoveHistoryEntry[]
  gameOver: string | null
  turn: Color
  isEngineTurn: boolean
  eloDelta: number | null
  currentElo: number
  totalHalfMoves: number
  viewIndex: number
  isLive: boolean
  canUndo: boolean
  onGoFirst: () => void
  onGoPrev: () => void
  onGoNext: () => void
  onGoLast: () => void
  onUndo: () => void
  onResign: () => void
  onNewGame: () => void
}

export default function SidePanel({
  history,
  gameOver,
  isEngineTurn,
  eloDelta,
  currentElo,
  totalHalfMoves,
  viewIndex,
  isLive,
  canUndo,
  onGoFirst,
  onGoPrev,
  onGoNext,
  onGoLast,
  onUndo,
  onResign,
  onNewGame,
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

      {/* Status — engine thinking or game over */}
      {(gameOver || isEngineTurn) && (
        <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className={`text-sm ${gameOver ? 'text-yellow-400 font-semibold capitalize' : 'text-gray-400'}`}>
            {gameOver ? gameOver.replace(/_/g, ' ') : 'Engine thinking…'}
          </span>
          {gameOver && deltaLabel && (
            <span className="text-xs font-semibold text-gray-400">
              {currentElo} <span className={deltaColor}>{deltaLabel}</span>
            </span>
          )}
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

      {/* New game — subtle footer button */}
      <button
        onClick={onNewGame}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
      >
        + New Game
      </button>

    </div>
  )
}
