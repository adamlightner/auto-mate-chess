import { Chessboard } from 'react-chessboard'

const TOPICS = [
  {
    title: 'King & Pawn Endings',
    description: 'The most fundamental endgame. Key squares, opposition, and the Lucena and Philidor positions.',
  },
  {
    title: 'Rook Endings',
    description: 'The most common endgame type. Active rook play, the seventh rank, and cut-off techniques.',
  },
  {
    title: 'Minor Piece Endings',
    description: 'Bishop vs knight, same-colour bishops, and when to trade into a won pawn ending.',
  },
  {
    title: 'Zugzwang',
    description: 'Positions where the obligation to move is a disadvantage. Essential in king and pawn endings.',
  },
  {
    title: 'Opposition & Triangulation',
    description: 'Control the key squares with your king using opposition and triangulation techniques.',
  },
]

export default function EndGame() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">End Game</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Where games are won and lost. Master endgame technique and turn advantages into victories.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Board preview — K+P ending position */}
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
