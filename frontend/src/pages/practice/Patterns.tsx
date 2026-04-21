import { Chessboard } from 'react-chessboard'

const DRILLS = [
  { title: 'Fork', description: 'A piece attacks two enemy pieces simultaneously — knight forks are the most common.' },
  { title: 'Pin', description: 'A piece cannot move without exposing a more valuable piece behind it.' },
  { title: 'Skewer', description: 'The reverse of a pin — the more valuable piece is forced to move, losing what is behind it.' },
  { title: 'Back Rank Mate', description: 'Deliver checkmate along the first or eighth rank when the king has no escape.' },
  { title: 'Discovered Attack', description: 'Moving one piece reveals an attack from a piece behind it.' },
]

export default function PracticePatterns() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tactical Patterns</h1>
        <p className="text-gray-400 mt-1 text-sm">
          See the same pattern across many different positions until recognising it is instant. Pattern recognition is the foundation of tactical strength.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-shrink-0 relative">
          <Chessboard
            boardWidth={360}
            position="r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
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
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Patterns</p>
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
