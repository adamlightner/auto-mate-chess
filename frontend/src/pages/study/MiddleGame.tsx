import { Chessboard } from 'react-chessboard'

const TOPICS = [
  {
    title: 'Pawn Structure',
    description: 'Understand passed pawns, isolated pawns, doubled pawns, and how structure shapes strategy.',
  },
  {
    title: 'Piece Activity',
    description: 'Maximize the scope of your pieces. Outposts, open files, and piece coordination.',
  },
  {
    title: 'Attacking the King',
    description: 'Learn how to build and execute attacks — piece sacrifices, pawn storms, and mating nets.',
  },
  {
    title: 'Defense',
    description: 'Hold difficult positions. Recognise threats early and find defensive resources.',
  },
  {
    title: 'Positional Play',
    description: 'Accumulate small advantages — better piece placement, space, and long-term planning.',
  },
]

export default function MiddleGame() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Middle Game</h1>
        <p className="text-gray-400 mt-1 text-sm">
          The engine of every chess game. Learn to coordinate your pieces, build attacks, and play with purpose.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Board preview */}
        <div className="flex-shrink-0 relative">
          <Chessboard
            boardWidth={360}
            position="r1bqk2r/pp1n1ppp/2pbpn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQkq - 0 7"
            arePiecesDraggable={false}
            customDarkSquareStyle={{ backgroundColor: '#7F77DD' }}
            customLightSquareStyle={{ backgroundColor: '#E8E6F8' }}
            customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-900/60">
            <p className="text-white font-semibold text-sm">Coming soon</p>
          </div>
        </div>

        {/* Topics */}
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Topics</p>
          {TOPICS.map((t) => (
            <div
              key={t.title}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 opacity-70"
            >
              <p className="text-white font-semibold text-sm">{t.title}</p>
              <p className="text-gray-400 text-xs mt-0.5 leading-snug">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
