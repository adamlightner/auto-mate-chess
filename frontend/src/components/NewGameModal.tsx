const ELO_OPTIONS = [1320, 1400, 1500, 1600, 1800, 2000, 2200, 2500, 2800, 3190]

function eloLabel(elo: number) {
  if (elo <= 1400) return 'Beginner — good for learning basics'
  if (elo <= 1600) return 'Intermediate — solid club-level play'
  if (elo <= 2000) return 'Advanced — strong positional understanding'
  if (elo <= 2500) return 'Expert — near master-level strength'
  return 'Maximum — full engine strength'
}

interface NewGameModalProps {
  engineElo: number
  playerColor: 'white' | 'black' | 'random'
  onEloChange: (elo: number) => void
  onColorChange: (color: 'white' | 'black' | 'random') => void
  onStart: () => void
}

const COLOR_OPTIONS: { value: 'white' | 'black' | 'random'; label: string; icon: string }[] = [
  { value: 'white', label: 'White', icon: '♔' },
  { value: 'black', label: 'Black', icon: '♚' },
  { value: 'random', label: 'Random', icon: '?' },
]

export default function NewGameModal({ engineElo, playerColor, onEloChange, onColorChange, onStart }: NewGameModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-80 flex flex-col gap-6 shadow-2xl">
        <div className="text-center">
          <img src="/automate-icon-512.svg" alt="AutoMate" className="w-12 h-12 mx-auto mb-3 rounded-xl" />
          <h2 className="text-xl font-bold text-white">New Game</h2>
          <p className="text-sm text-gray-400 mt-1">Choose your opponent strength</p>
        </div>

        {/* Color selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Play as
          </label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => onColorChange(value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  playerColor === value
                    ? 'border-brand bg-brand/20 text-white'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                <span className="text-lg leading-none">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ELO selection */}
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
          <p className="text-xs text-gray-500">{eloLabel(engineElo)}</p>
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
