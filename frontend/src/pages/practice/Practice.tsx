import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    to: '/practice/openings',
    title: 'Opening Drills',
    description: 'Build muscle memory for your repertoire. Play opening lines against a move tree and get instant feedback on every move.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    topics: ['Italian Game', 'Sicilian Najdorf', "Queen's Gambit", 'Ruy López', "King's Indian"],
  },
  {
    to: '/practice/endgames',
    title: 'Endgame Technique',
    description: 'Drill the essential theoretical positions until they are automatic. King and pawn, rook endings, and more.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
    topics: ['K+P vs K', 'Lucena Position', 'Philidor Position', 'Rook Cut-off', 'Opposition'],
  },
  {
    to: '/practice/patterns',
    title: 'Tactical Patterns',
    description: 'Train your pattern recognition. See the same tactical shape across many positions until spotting it is instant.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    topics: ['Fork', 'Pin', 'Skewer', 'Back Rank', 'Discovered Attack'],
  },
]

export default function Practice() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Practice</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Get reps in. Move the pieces, make mistakes, and build the intuition that only comes from repetition.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SECTIONS.map(({ to, title, description, icon, topics }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="bg-gray-800 hover:bg-gray-700/60 border border-gray-700 hover:border-brand/40 rounded-xl p-5 text-left flex flex-col gap-3 transition-colors group cursor-default opacity-60"
          >
            <div className="flex items-start justify-between">
              <span className="text-brand-light group-hover:text-brand-lighter transition-colors">
                {icon}
              </span>
              <span className="text-xs text-gray-600 border border-gray-700 rounded-full px-2 py-0.5">
                Coming soon
              </span>
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
