import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    to: '/study/openings',
    title: 'Openings',
    description: 'Browse opening theory, step through main lines, and understand the key ideas and plans behind each system.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    topics: ['Sicilian Defense', "Queen's Gambit", "King's Indian", 'Ruy López', 'French Defense'],
    available: true,
  },
  {
    to: '/study/middlegame',
    title: 'Middle Game',
    description: 'Master the heart of the game. Piece coordination, pawn structures, attacks, and positional play.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    topics: ['Pawn Structure', 'Piece Activity', 'Attacking the King', 'Defense', 'Positional Play'],
    available: false,
  },
  {
    to: '/study/endgame',
    title: 'End Game',
    description: 'Convert your advantages. King and pawn endings, rook endings, and theoretical positions.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
    topics: ['King & Pawn', 'Rook Endings', 'Minor Piece Endings', 'Zugzwang', 'Opposition'],
    available: false,
  },
]

export default function Study() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Study</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Explore chess theory at your own pace — read, browse positions, and build your understanding.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SECTIONS.map(({ to, title, description, icon, topics, available }) => (
          <button
            key={to}
            onClick={() => available && navigate(to)}
            className={`bg-gray-800 border border-gray-700 rounded-xl p-5 text-left flex flex-col gap-3 transition-colors group ${
              available
                ? 'hover:bg-gray-700/60 hover:border-brand/40 cursor-pointer'
                : 'opacity-60 cursor-default'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="text-brand-light group-hover:text-brand-lighter transition-colors">
                {icon}
              </span>
              {!available && (
                <span className="text-xs text-gray-600 border border-gray-700 rounded-full px-2 py-0.5">
                  Coming soon
                </span>
              )}
            </div>

            <div>
              <h2 className="text-white font-bold text-base">{title}</h2>
              <p className="text-gray-400 text-sm mt-1 leading-snug">{description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-auto">
              {topics.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-400">
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
