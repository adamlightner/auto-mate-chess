import { useEffect, useRef } from 'react'
import type { MoveClassification, MoveHistoryEntry } from '../types/chess'

interface MoveHistoryProps {
  history: MoveHistoryEntry[]
  showClassifications: boolean
}

const CLASS_STYLE: Record<MoveClassification, { symbol: string; dot: string; title: string }> = {
  brilliant:  { symbol: '!!', dot: 'bg-teal-400',   title: 'Brilliant' },
  best:       { symbol: '!',  dot: 'bg-green-400',  title: 'Best' },
  excellent:  { symbol: '!',  dot: 'bg-green-300',  title: 'Excellent' },
  good:       { symbol: '',   dot: 'bg-lime-400',   title: 'Good' },
  inaccuracy: { symbol: '?!', dot: 'bg-yellow-400', title: 'Inaccuracy' },
  mistake:    { symbol: '?',  dot: 'bg-orange-400', title: 'Mistake' },
  blunder:    { symbol: '??', dot: 'bg-red-400',    title: 'Blunder' },
}

function ClassBadge({ cls }: { cls: MoveClassification }) {
  const { symbol, dot, title } = CLASS_STYLE[cls]
  return (
    <span className="inline-flex items-center gap-0.5 ml-1" title={title}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {symbol && (
        <span className={`text-xs font-bold leading-none`} style={{ color: 'inherit' }}>
          {symbol}
        </span>
      )}
    </span>
  )
}

export default function MoveHistory({ history, showClassifications }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {history.length === 0 && (
          <p className="text-gray-500 text-sm">No moves yet.</p>
        )}
        {history.map((entry) => (
          <div key={entry.moveNumber} className="flex text-sm font-mono">
            <span className="w-8 text-gray-500">{entry.moveNumber}.</span>
            <span className="w-20 text-white flex items-baseline">
              {entry.white ?? ''}
              {showClassifications && entry.whiteClass && (
                <ClassBadge cls={entry.whiteClass} />
              )}
            </span>
            <span className="w-20 text-gray-300 flex items-baseline">
              {entry.black ?? ''}
              {showClassifications && entry.blackClass && (
                <ClassBadge cls={entry.blackClass} />
              )}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
