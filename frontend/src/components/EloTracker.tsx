import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { EloPoint } from '../api/client'

interface EloTrackerProps {
  history: EloPoint[]
  currentElo: number
}

export default function EloTracker({ history, currentElo }: EloTrackerProps) {
  // Prepend a synthetic starting point so the chart has an origin
  const startElo = history.length > 0 ? history[0].elo_before : currentElo
  const chartData = [
    { game: 0, elo: startElo },
    ...history.map((p, i) => ({ game: i + 1, elo: p.elo_after, result: p.result, delta: p.elo_delta })),
  ]

  function dotColor(result: string) {
    if (result === 'win') return '#4ade80'
    if (result === 'loss') return '#f87171'
    return '#facc15'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">ELO Progress</h2>
        <span className="text-white font-bold text-lg">{currentElo}</span>
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-sm italic">Play a game to start tracking your ELO.</p>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <XAxis dataKey="game" tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '6px', fontSize: 12 }}
              labelFormatter={(v) => `Game ${v}`}
              formatter={(value, _, props) => {
                const delta = props.payload?.delta
                const sign = delta > 0 ? '+' : ''
                return [`${value}${delta !== undefined ? ` (${sign}${delta})` : ''}`, 'ELO']
              }}
            />
            <ReferenceLine y={startElo} stroke="#374151" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="elo"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props
                if (payload.game === 0) return <g key={`dot-${cx}`} />
                return (
                  <circle
                    key={`dot-${cx}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={dotColor(payload.result)}
                    stroke="none"
                  />
                )
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {history.length > 0 && (
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Win</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Loss</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Draw</span>
        </div>
      )}
    </div>
  )
}
