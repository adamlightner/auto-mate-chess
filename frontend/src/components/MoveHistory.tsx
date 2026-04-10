import { useEffect, useRef } from 'react'
import type { MoveHistoryEntry } from '../types/chess'

interface MoveHistoryProps {
  history: MoveHistoryEntry[]
}

export default function MoveHistory({ history }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Moves
      </h2>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {history.length === 0 && (
          <p className="text-gray-500 text-sm">No moves yet.</p>
        )}
        {history.map((entry) => (
          <div key={entry.moveNumber} className="flex text-sm font-mono">
            <span className="w-8 text-gray-500">{entry.moveNumber}.</span>
            <span className="w-16 text-white">{entry.white ?? ''}</span>
            <span className="w-16 text-gray-300">{entry.black ?? ''}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
