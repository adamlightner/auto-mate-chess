import { useEffect, useState } from 'react'
import EloTracker from '../components/EloTracker'
import { fetchCurrentElo, fetchEloHistory } from '../api/client'
import type { EloPoint } from '../api/client'

export default function Profile() {
  const [currentElo, setCurrentElo] = useState(1200)
  const [history, setHistory] = useState<EloPoint[]>([])

  useEffect(() => {
    Promise.all([fetchCurrentElo(), fetchEloHistory()]).then(([elo, hist]) => {
      setCurrentElo(elo)
      setHistory(hist)
    })
  }, [])

  const wins = history.filter((g) => g.result === 'win').length
  const draws = history.filter((g) => g.result === 'draw').length
  const losses = history.filter((g) => g.result === 'loss').length
  const total = history.length
  const winPct = total ? Math.round((wins / total) * 100) : 0
  const eloChange = total ? history[total - 1].elo_after - history[0].elo_before : 0

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Current ELO', value: currentElo },
          { label: 'Games Played', value: total },
          { label: 'Win Rate', value: total ? `${winPct}%` : '—' },
          { label: 'ELO Change', value: total ? `${eloChange > 0 ? '+' : ''}${eloChange}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Win/draw/loss bar */}
      {total > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="text-green-400">{wins}W</span>
            <span className="text-yellow-400">{draws}D</span>
            <span className="text-red-400">{losses}L</span>
          </div>
          <div className="flex h-2 rounded overflow-hidden gap-px">
            {wins > 0 && <div className="bg-green-400" style={{ flex: wins }} />}
            {draws > 0 && <div className="bg-yellow-400" style={{ flex: draws }} />}
            {losses > 0 && <div className="bg-red-400" style={{ flex: losses }} />}
          </div>
        </div>
      )}

      {/* ELO chart */}
      <EloTracker history={history} currentElo={currentElo} />

      {/* Game history table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Game History</h2>
        </div>
        {total === 0 ? (
          <p className="text-gray-500 text-sm italic p-4">No games yet — play your first game!</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase">
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Result</th>
                <th className="px-4 py-2 text-left">ELO</th>
                <th className="px-4 py-2 text-left">Opponent</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((g, i) => {
                const delta = g.elo_delta
                const deltaLabel = `${delta > 0 ? '+' : ''}${delta}`
                const resultColor =
                  g.result === 'win' ? 'text-green-400' : g.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                const date = g.created_at
                  ? new Date(g.created_at).toLocaleDateString()
                  : '—'
                return (
                  <tr key={g.game_id} className="border-b border-gray-700 last:border-0 hover:bg-gray-750">
                    <td className="px-4 py-2 text-gray-500">{total - i}</td>
                    <td className={`px-4 py-2 font-semibold capitalize ${resultColor}`}>{g.result}</td>
                    <td className="px-4 py-2">
                      <span className="text-white">{g.elo_after}</span>
                      <span className={`ml-1 text-xs ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {deltaLabel}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-400">Bot ({g.engine_elo})</td>
                    <td className="px-4 py-2 text-gray-400">{date}</td>
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
