import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    to: '/learn/openings',
    title: 'Opening',
    description: 'Learn the critical first moves. Drill opening lines, understand theory, and build a solid repertoire.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    topics: ['Sicilian Defense', "Queen's Gambit", "King's Indian", 'Ruy López', 'French Defense'],
    status: 'placeholder',
  },
  {
    to: '/learn/middle-game',
    title: 'Middle Game',
    description: 'Master the heart of the game. Piece coordination, pawn structures, attacks, and positional play.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    topics: ['Pawn Structure', 'Piece Activity', 'Attacking the King', 'Defense', 'Positional Play'],
    status: 'placeholder',
  },
  {
    to: '/learn/end-game',
    title: 'End Game',
    description: 'Convert your advantages. King and pawn endings, rook endings, and theoretical positions.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
    topics: ['King & Pawn', 'Rook Endings', 'Minor Piece Endings', 'Zugzwang', 'Opposition'],
    status: 'placeholder',
  },
  {
    to: '/learn/puzzles',
    title: 'Puzzles',
    description: 'Sharpen your tactics. Solve positions filtered by theme and difficulty, rated against your ELO.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    topics: ['Fork', 'Pin', 'Skewer', 'Back Rank', 'Sacrifice'],
    status: 'placeholder',
  },
]

export default function Learn() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Learn</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Work through the four phases of chess — from the first move to the final conversion.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SECTIONS.map(({ to, title, description, icon, topics }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="bg-gray-800 hover:bg-gray-700/60 border border-gray-700 hover:border-brand/40 rounded-xl p-5 text-left flex flex-col gap-3 transition-colors group"
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
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-400"
                >
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
