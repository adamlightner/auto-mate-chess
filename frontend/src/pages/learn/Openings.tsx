import { Chessboard } from 'react-chessboard'

const OPENINGS = [
  { name: "Sicilian Defense", moves: "1. e4 c5", color: "bg-purple-900" },
  { name: "Queen's Gambit", moves: "1. d4 d5 2. c4", color: "bg-purple-900" },
  { name: "King's Indian", moves: "1. d4 Nf6 2. c4 g6", color: "bg-green-900" },
  { name: "French Defense", moves: "1. e4 e6", color: "bg-yellow-900" },
  { name: "Ruy López", moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5", color: "bg-red-900" },
  { name: "Caro-Kann", moves: "1. e4 c6", color: "bg-indigo-900" },
]

export default function Openings() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Opening Trainer</h1>
        <p className="text-gray-400 mt-1 text-sm">Learn and drill opening lines with move-by-move guidance.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Board preview */}
        <div className="flex-shrink-0">
          <Chessboard
            boardWidth={360}
            arePiecesDraggable={false}
            customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
            customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          />
        </div>

        {/* Opening picker */}
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Select an opening</p>
          {OPENINGS.map((o) => (
            <button
              key={o.name}
              disabled
              className={`${o.color} text-left px-4 py-3 rounded-lg opacity-60 cursor-not-allowed border border-gray-700`}
            >
              <p className="text-white font-semibold text-sm">{o.name}</p>
              <p className="text-gray-400 text-xs mt-0.5 font-mono">{o.moves}</p>
            </button>
          ))}
          <p className="text-gray-600 text-xs italic mt-1">Opening trainer coming in Phase 8.</p>
        </div>
      </div>
    </div>
  )
}
