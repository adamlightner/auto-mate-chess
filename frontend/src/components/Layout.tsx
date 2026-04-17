import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

// ── Icons ─────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4m5-8l2 2M5 10v10a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1V10" />
  </svg>
)

const PlayIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M14.752 11.168l-6.586-3.795A1 1 0 006.5 8.25v7.5a1 1 0 001.666.748l6.586-3.795a1 1 0 000-1.535z" />
    <circle cx="12" cy="12" r="9" strokeWidth={1.75} />
  </svg>
)

const LearnIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
)

const OpeningsIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const MiddleGameIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
)

const EndGameIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
  </svg>
)

const PuzzleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
      d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
  </svg>
)

// TODO: replace hardcoded name with user data from API
const USER_NAME = 'Adam'
const USER_AVATAR_URL: string | null = null

const ProfileAvatar = () => {
  if (USER_AVATAR_URL) {
    return (
      <img
        src={USER_AVATAR_URL}
        alt={USER_NAME}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
      />
    )
  }
  return (
    <span className="w-7 h-7 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center flex-shrink-0 select-none">
      {USER_NAME[0].toUpperCase()}
    </span>
  )
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────────────────────
function useCollapsed() {
  const stored = localStorage.getItem('sidebar-collapsed')
  const [collapsed, setCollapsed] = useState(stored === 'true')
  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem('sidebar-collapsed', String(!c))
      return !c
    })
  }
  return { collapsed, toggle }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Layout() {
  const location = useLocation()
  const learnActive = location.pathname.startsWith('/learn')
  const [learnOpen, setLearnOpen] = useState(learnActive)
  const { collapsed, toggle } = useCollapsed()

  // Shared active / inactive class builders
  const activeBase = 'bg-gray-700/60 text-white border-l-2 border-brand-light'
  const inactiveBase = 'text-gray-400 hover:text-white hover:bg-gray-700/40 border-l-2 border-transparent'

  const navItem = (to: string, label: string, icon: React.ReactNode) => (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
          isActive ? activeBase : inactiveBase
        } ${collapsed ? 'justify-center px-0' : ''}`
      }
    >
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )

  return (
    <div className="h-screen bg-gray-900 text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col p-3 gap-1 transition-all duration-300 ${
          collapsed ? 'w-[60px]' : 'w-56'
        }`}
      >
        {/* Logo / wordmark + collapse toggle */}
        <div className="flex items-center mb-2">
          <NavLink
            to="/home"
            title={collapsed ? 'Home' : undefined}
            className="flex-1 flex items-center justify-center px-1 py-3 rounded-lg transition-colors hover:bg-gray-700/40"
          >
            {collapsed ? (
              <HomeIcon />
            ) : (
              <img src="/automate-wordmark.svg" alt="AutoMate" className="w-full" />
            )}
          </NavLink>
          {!collapsed && (
            <button
              onClick={toggle}
              title="Collapse sidebar"
              className="flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700/40 transition-colors flex-shrink-0"
            >
              <CollapseIcon collapsed={collapsed} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={toggle}
            title="Expand sidebar"
            className="flex items-center justify-center w-full py-1.5 mb-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700/40 transition-colors"
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
        )}

        {navItem('/home', 'Home', <HomeIcon />)}
        {navItem('/play', 'Play', <PlayIcon />)}
        {navItem('/puzzles', 'Puzzles', <PuzzleIcon />)}

        {/* Learn — expandable */}
        <div>
          <button
            onClick={() => setLearnOpen((o) => !o)}
            title={collapsed ? 'Learn' : undefined}
            className={`w-full text-left rounded-lg text-base font-semibold transition-colors flex items-center border-l-2 border-transparent py-2.5 ${
              collapsed ? 'justify-center px-0' : 'px-3 gap-3'
            } ${
              learnActive
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/40'
            }`}
          >
            <LearnIcon />
            {!collapsed && (
              <>
                <span className="flex-1">Learn</span>
                <ChevronIcon open={learnOpen} />
              </>
            )}
          </button>

          {learnOpen && !collapsed && (
            <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-gray-700 pl-3">
              {navItem('/learn/openings', 'Opening', <OpeningsIcon />)}
              {navItem('/learn/middle-game', 'Middle Game', <MiddleGameIcon />)}
              {navItem('/learn/end-game', 'End Game', <EndGameIcon />)}
            </div>
          )}

          {/* Collapsed: show sub-items as standalone icon rows */}
          {collapsed && (
            <div className="flex flex-col gap-1 mt-1">
              {[
                { to: '/learn/openings',    title: 'Opening',     Icon: OpeningsIcon },
                { to: '/learn/middle-game', title: 'Middle Game', Icon: MiddleGameIcon },
                { to: '/learn/end-game',    title: 'End Game',    Icon: EndGameIcon },
              ].map(({ to, title, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={title}
                  className={({ isActive }) =>
                    `flex justify-center py-2.5 rounded-lg border-l-2 transition-colors ${
                      isActive ? activeBase : inactiveBase
                    }`
                  }
                >
                  <Icon />
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Spacer — pushes Profile + toggle to bottom */}
        <div className="flex-1" />

        <div className="border-t border-gray-700 my-1" />

        {/* Profile pinned at bottom */}
        <NavLink
          to="/profile"
          title={collapsed ? USER_NAME : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold transition-colors border-l-2 ${
              isActive ? activeBase : inactiveBase
            } ${collapsed ? 'justify-center px-0' : ''}`
          }
        >
          <ProfileAvatar />
          {!collapsed && <span className="truncate">{USER_NAME}</span>}
        </NavLink>
      </aside>

      {/* Page content */}
      <main className="flex-1 h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
