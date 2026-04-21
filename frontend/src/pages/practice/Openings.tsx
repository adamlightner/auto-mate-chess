import { Chessboard } from 'react-chessboard'

const DRILLS = [
  { title: 'Italian Game', description: 'Drill the main line and key variations through move 10.' },
  { title: 'Ruy López', description: 'Practice the Morphy Defense and Berlin — two essential systems.' },
  { title: 'Sicilian Najdorf', description: 'Build fluency in the most complex opening in chess.' },
  { title: "Queen's Gambit", description: 'Drill both QGD and QGA responses to 1.d4 d5 2.c4.' },
  { title: "King's Indian", description: 'Practice the Classical and Sämisch variations as Black.' },
]

export default function PracticeOpenings() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Opening Drills</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Select an opening and play through the main line from memory. Get instant feedback on every move and request hints when stuck.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-shrink-0 relative">
          <Chessboard
            boardWidth={360}
            position="start"
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
