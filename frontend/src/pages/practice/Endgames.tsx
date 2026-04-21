import { Chessboard } from 'react-chessboard'

const DRILLS = [
  { title: 'K+P vs K', description: 'Win with a king and pawn — key squares, opposition, and the rule of the square.' },
  { title: 'Lucena Position', description: 'The fundamental winning technique in rook and pawn endings.' },
  { title: 'Philidor Position', description: 'The essential drawing technique when defending a rook ending.' },
  { title: 'Rook Cut-off', description: 'Use the rook to cut off the opposing king and support pawn promotion.' },
  { title: 'Opposition & Triangulation', description: 'Control key squares with the king in pure pawn endings.' },
]

export default function PracticeEndgames() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Endgame Technique</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Drill the theoretical positions that appear in real games. Repeat each technique until it is automatic.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-shrink-0 relative">
          <Chessboard
            boardWidth={360}
            position="8/8/4k3/8/4K3/8/4P3/8 w - - 0 1"
            arePiecesDraggable={false}
            customDarkSquareStyle={{ backgroundColor: '#7F77DD' }}
            customLightSquareStyle={{ backgroundColor: '#E8E6F8' }}
            customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-900/60">
            <p className="text-white font-semibold text-sm">Coming soon</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Drills</p>
          {DRILLS.map((d) => (
            <div key={d.title} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 opacity-70">
              <p className="text-white font-semibold text-sm">{d.title}</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-snug">{d.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
