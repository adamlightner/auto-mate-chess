const ELO_OPTIONS = [1320, 1400, 1500, 1600, 1800, 2000, 2200, 2500, 2800, 3190]

interface NewGameModalProps {
  engineElo: number
  onEloChange: (elo: number) => void
  onStart: () => void
}

export default function NewGameModal({ engineElo, onEloChange, onStart }: NewGameModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-80 flex flex-col gap-6 shadow-2xl">
        <div className="text-center">
          <img src="/automate-icon-512.svg" alt="AutoMate" className="w-12 h-12 mx-auto mb-3 rounded-xl" />
          <h2 className="text-xl font-bold text-white">New Game</h2>
          <p className="text-sm text-gray-400 mt-1">Choose your opponent strength</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Engine ELO
          </label>
          <select
            value={engineElo}
            onChange={(e) => onEloChange(Number(e.target.value))}
            className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand"
          >
            {ELO_OPTIONS.map((elo) => (
              <option key={elo} value={elo}>{elo}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {engineElo <= 1400 ? 'Beginner — good for learning basics'
              : engineElo <= 1600 ? 'Intermediate — solid club-level play'
              : engineElo <= 2000 ? 'Advanced — strong positional understanding'
              : engineElo <= 2500 ? 'Expert — near master-level strength'
              : 'Maximum — full engine strength'}
          </p>
        </div>

        <button
          onClick={onStart}
          className="w-full py-3 rounded-lg bg-brand-dark hover:bg-brand text-white font-semibold text-sm transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
