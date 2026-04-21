import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCurrentElo, fetchEloHistory } from '../api/client'
import type { EloPoint } from '../api/client'

// ── Icons (consistent with sidebar) ──────────────────────────────────────────
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M14.752 11.168l-6.586-3.795A1 1 0 006.5 8.25v7.5a1 1 0 001.666.748l6.586-3.795a1 1 0 000-1.535z" />
    <circle cx="12" cy="12" r="9" strokeWidth={1.75} />
  </svg>
)

const OpeningsIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const PuzzleIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
)

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

// ── Template learning data (replace with API data in Phase 9) ─────────────────
const LEARNING_DATA = {
  opening: 'Sicilian Defense',
  variation: 'The Najdorf Variation',
  progress: 3,
  total: 5,
  next: 'The Poisoned Pawn Variation',
}

// ── Nav shortcut cards ────────────────────────────────────────────────────────
const NAV_CARDS = [
  {
    to: '/play',
    icon: <PlayIcon />,
    title: 'Play',
    description: 'Challenge the engine at any rating. Your ELO updates after every game.',
  },
  {
    to: '/study',
    icon: <OpeningsIcon />,
    title: 'Study',
    description: 'Opening, middle game, and endgame — work through every phase of chess.',
  },
  {
    to: '/puzzles',
    icon: <PuzzleIcon />,
    title: 'Puzzles',
    description: 'Sharpen your tactics with puzzles filtered by theme and difficulty.',
  },
  {
    to: '/profile',
    icon: <ProfileIcon />,
    title: 'Profile',
    description: 'Track your ELO over time, review game history, and monitor your progress.',
  },
]

// TODO: replace with real user data from API
const USER_NAME = 'Adam'
const USER_AVATAR_URL: string | null = null

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const [currentElo, setCurrentElo] = useState<number | null>(null)
  const [history, setHistory] = useState<EloPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchCurrentElo(), fetchEloHistory()])
      .then(([elo, hist]) => {
        setCurrentElo(elo)
        setHistory(hist)
      })
      .finally(() => setLoading(false))
  }, [])

  const total = history.length
  const wins = history.filter((g) => g.result === 'win').length
  const winPct = total ? Math.round((wins / total) * 100) : null
  const recent = [...history].reverse().slice(0, 5)
  const hasGames = total > 0

  const learnPct = Math.round((LEARNING_DATA.progress / LEARNING_DATA.total) * 100)

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-6">

      {/* Row 1 — Hero + Profile stats tile */}
      <div className="flex gap-4 items-stretch">
        {/* Hero */}
        <div className="flex-[2] bg-gray-800 rounded-xl p-8 flex flex-col justify-center gap-3">
          <img src="/automate-logo-horizontal.svg" alt="AutoMate" className="w-full" />
          <p className="text-gray-400 text-sm leading-relaxed">
            An AI-assisted chess platform. Play, learn, and watch your rating climb.
          </p>
        </div>

        {/* Profile stats tile */}
        <div className="flex-1 bg-gray-800 rounded-xl p-5 flex flex-col gap-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            {USER_AVATAR_URL ? (
              <img src={USER_AVATAR_URL} alt={USER_NAME}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-brand text-white text-base font-bold flex items-center justify-center flex-shrink-0 select-none">
                {USER_NAME[0].toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-white font-semibold text-sm">{USER_NAME}</p>
              <p className="text-gray-500 text-xs">Player</p>
            </div>
          </div>

          <div className="border-t border-gray-700" />

          {/* Stats */}
          {loading ? (
            <p className="text-gray-500 text-sm italic">Loading…</p>
          ) : !hasGames ? (
            <p className="text-gray-500 text-xs leading-relaxed">
              No games yet. Play your first game to see your stats here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: 'ELO', value: currentElo ?? '—' },
                { label: 'Games', value: total },
                { label: 'Win Rate', value: winPct !== null ? `${winPct}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span className="text-white text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — Navigation shortcut tiles */}
      <div className="grid grid-cols-4 gap-3">
        {NAV_CARDS.map(({ to, icon, title, description }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="bg-gray-800 hover:bg-gray-700/60 border border-gray-700 hover:border-gray-600 rounded-xl p-4 text-left flex flex-col gap-2 transition-colors group"
          >
            <span className="text-brand-light group-hover:text-brand-lighter transition-colors">{icon}</span>
            <span className="text-white font-semibold text-sm">{title}</span>
            <span className="text-gray-400 text-xs leading-snug">{description}</span>
          </button>
        ))}
      </div>

      {/* Row 3 — Continue Learning */}
      <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <BookIcon />
            <span className="text-xs font-semibold uppercase tracking-wider">Continue Learning</span>
          </div>
          <button
            onClick={() => navigate('/study')}
            className="flex items-center gap-1 text-xs text-brand-light hover:text-brand-lighter transition-colors"
          >
            View all <ChevronRightIcon />
          </button>
        </div>

        <div className="flex items-center justify-between gap-6">
          {/* Current chapter */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-0.5">{LEARNING_DATA.opening}</p>
            <p className="text-white font-semibold text-sm">{LEARNING_DATA.variation}</p>
          </div>
          {/* Next chapter */}
          <div className="text-right flex-1">
            <p className="text-xs text-gray-500 mb-0.5">Up next</p>
            <p className="text-gray-300 text-sm">{LEARNING_DATA.next}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">{LEARNING_DATA.progress} of {LEARNING_DATA.total} lines complete</span>
            <span className="text-xs text-brand-light font-semibold">{learnPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{ width: `${learnPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => navigate('/study')}
          className="self-start px-4 py-2 bg-brand-dark hover:bg-brand text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>

      {/* Row 4 — Recent Games (bottom) */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Games</h2>
          {total > 5 && (
            <button
              onClick={() => navigate('/profile')}
              className="text-xs text-brand-light hover:text-brand-lighter transition-colors"
            >
              View all →
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm italic p-5">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-gray-500 text-sm italic p-5">No games yet — play your first game!</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase">
              <tr className="border-b border-gray-700">
                <th className="px-5 py-2 text-left">Result</th>
                <th className="px-5 py-2 text-left">ELO</th>
                <th className="px-5 py-2 text-left">Opponent</th>
                <th className="px-5 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((g) => {
                const delta = g.elo_delta
                const deltaLabel = `${delta > 0 ? '+' : ''}${delta}`
                const resultColor =
                  g.result === 'win' ? 'text-green-400'
                  : g.result === 'loss' ? 'text-red-400'
                  : 'text-yellow-400'
                const date = g.created_at ? new Date(g.created_at).toLocaleDateString() : '—'
                return (
                  <tr key={g.game_id} className="border-b border-gray-700 last:border-0">
                    <td className={`px-5 py-2.5 font-semibold capitalize ${resultColor}`}>{g.result}</td>
                    <td className="px-5 py-2.5">
                      <span className="text-white">{g.elo_after}</span>
                      <span className={`ml-1 text-xs ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {deltaLabel}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-gray-400">Bot ({g.engine_elo})</td>
                    <td className="px-5 py-2.5 text-gray-400">{date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
