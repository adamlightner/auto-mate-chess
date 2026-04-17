import { Chessboard } from 'react-chessboard'

const THEMES = [
  "Fork", "Pin", "Skewer", "Discovered Attack",
  "Back Rank", "Zugzwang", "Sacrifice", "Checkmate Pattern",
]

export default function Puzzles() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Puzzles</h1>
        <p className="text-gray-400 mt-1 text-sm">Sharpen your tactics with puzzles sourced from Lichess.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Board preview */}
        <div className="flex-shrink-0 relative">
          <Chessboard
            boardWidth={360}
            arePiecesDraggable={false}
            customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
            customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-900/60">
            <p className="text-white font-semibold text-sm">Coming soon</p>
          </div>
        </div>

        {/* Themes + info */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-3">Puzzle Themes</p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold text-white">What to expect</p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Puzzles pulled from the Lichess database</li>
              <li>Filtered by your ELO rating range</li>
              <li>Filter by tactical theme</li>
              <li>Ask the LLM to explain why the solution works</li>
              <li>Track puzzles solved and puzzle rating</li>
            </ul>
          </div>

          <p className="text-gray-600 text-xs italic">Puzzle trainer coming in Phase 8.</p>
        </div>
      </div>
    </div>
  )
}
