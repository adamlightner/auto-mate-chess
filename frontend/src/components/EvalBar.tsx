interface EvalBarProps {
  scoreCp: number
  isAnalyzing: boolean
  height?: number
}

export default function EvalBar({ scoreCp, isAnalyzing, height = 560 }: EvalBarProps) {
  const isMate = Math.abs(scoreCp) >= 30000
  const clamped = Math.max(-800, Math.min(800, scoreCp))
  // whitePercent: 50 = equal, 100 = full white advantage, 0 = full black advantage
  const whitePercent = 50 + (clamped / 800) * 50

  const label = isMate
    ? scoreCp > 0 ? 'M' : '-M'
    : isAnalyzing
    ? '…'
    : (scoreCp / 100).toFixed(1)

  return (
    <div className="flex flex-col items-center gap-1 select-none" style={{ height, width: 20 }}>
      <span className="text-xs font-mono text-gray-400 leading-none">{label}</span>
      <div className="flex-1 w-full rounded overflow-hidden flex flex-col">
        {/* Black portion (top) */}
        <div
          className="w-full bg-gray-700 transition-all duration-500"
          style={{ height: `${100 - whitePercent}%` }}
        />
        {/* White portion (bottom) */}
        <div
          className="w-full bg-gray-100 transition-all duration-500"
          style={{ height: `${whitePercent}%` }}
        />
      </div>
    </div>
  )
}
