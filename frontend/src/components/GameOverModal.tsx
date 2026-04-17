interface Props {
  gameOver: string           // termination: 'checkmate', 'stalemate', 'resigned', etc.
  gameResult: string         // 'win' | 'loss' | 'draw'
  eloDelta: number | null
  currentElo: number
  onReview: () => void
  onRematch: () => void
  onNewBot: () => void
}

const DRAW_LABELS: Record<string, string> = {
  stalemate: 'Stalemate',
  insufficient_material: 'Insufficient material',
  fifty_moves: '50-move rule',
  seventyfive_moves: '75-move rule',
  threefold_repetition: 'Threefold repetition',
  fivefold_repetition: 'Fivefold repetition',
}

function getDisplay(gameOver: string, gameResult: string) {
  if (gameResult === 'win') {
    return {
      headline: 'You Win',
      sub: gameOver === 'checkmate' ? 'by checkmate' : gameOver.replace(/_/g, ' '),
      headlineColor: 'text-green-400',
    }
  }
  if (gameResult === 'loss') {
    const sub = gameOver === 'resigned'
      ? 'you resigned'
      : gameOver === 'checkmate'
      ? 'by checkmate'
      : gameOver.replace(/_/g, ' ')
    return { headline: 'You Lost', sub, headlineColor: 'text-red-400' }
  }
  // draw
  const sub = DRAW_LABELS[gameOver] ?? gameOver.replace(/_/g, ' ')
  return { headline: 'Draw', sub, headlineColor: 'text-yellow-400' }
}

export default function GameOverModal({
  gameOver,
  gameResult,
  eloDelta,
  currentElo,
  onReview,
  onRematch,
  onNewBot,
}: Props) {
  const { headline, sub, headlineColor } = getDisplay(gameOver, gameResult)
  const deltaSign = eloDelta !== null && eloDelta > 0 ? '+' : ''
  const deltaColor =
    eloDelta == null ? 'text-gray-400'
    : eloDelta > 0 ? 'text-green-400'
    : eloDelta < 0 ? 'text-red-400'
    : 'text-yellow-400'
  const eloAfter = eloDelta != null ? currentElo : null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-80 flex flex-col gap-5 shadow-2xl">

        {/* Result */}
        <div className="text-center flex flex-col gap-1">
          <h2 className={`text-2xl font-bold ${headlineColor}`}>{headline}</h2>
          {sub && <p className="text-sm text-gray-400 capitalize">{sub}</p>}
        </div>

        {/* ELO change */}
        {eloAfter !== null && eloDelta !== null && (
          <div className="bg-gray-700/50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Rating</span>
            <span className="text-sm font-mono text-white">
              {eloAfter - eloDelta}
              <span className="text-gray-500 mx-1.5">→</span>
              {eloAfter}
              <span className={`ml-1.5 font-semibold ${deltaColor}`}>
                ({deltaSign}{eloDelta})
              </span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={onRematch}
              className="flex-1 py-2.5 rounded-lg bg-brand-dark hover:bg-brand text-white text-sm font-semibold transition-colors"
            >
              Rematch
            </button>
            <button
              onClick={onNewBot}
              className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors"
            >
              New Bot
            </button>
          </div>
          <button
            onClick={onReview}
            className="w-full py-2 rounded-lg border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white text-sm transition-colors"
          >
            Review Game
          </button>
        </div>

      </div>
    </div>
  )
}
