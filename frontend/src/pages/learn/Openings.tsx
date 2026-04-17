import { useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { OPENINGS, LEVEL_LABELS, LEVEL_COLORS, LEVEL_DOT } from '../../data/openings'
import type { Level, Opening } from '../../data/openings'

const ALL_LEVELS: Level[] = ['beginner', 'intermediate', 'advanced', 'master']

// ── Icons ─────────────────────────────────────────────────────────────────────

const FirstIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
)

const PrevIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const NextIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const LastIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeFenAtIndex(moves: string[], index: number): string {
  const chess = new Chess()
  for (let i = 0; i < index; i++) {
    try { chess.move(moves[i]) } catch { break }
  }
  return chess.fen()
}

function computeLastMove(moves: string[], index: number): { from: string; to: string } | null {
  if (index === 0) return null
  const chess = new Chess()
  for (let i = 0; i < index - 1; i++) {
    try { chess.move(moves[i]) } catch { break }
  }
  try {
    const result = chess.move(moves[index - 1])
    return result ? { from: result.from, to: result.to } : null
  } catch {
    return null
  }
}

// Build the move tokens: [{label, halfMoveIndex}]
function buildMoveTokens(moves: string[]) {
  return moves.map((san, i) => ({ san, halfMoveIndex: i + 1 }))
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Openings() {
  const [colorFilter, setColorFilter] = useState<'white' | 'black'>('white')
  const [levelFilter, setLevelFilter] = useState<Level | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [moveIndex, setMoveIndex] = useState(0)

  const filtered = useMemo(() =>
    OPENINGS.filter(
      (o) =>
        o.color === colorFilter &&
        (levelFilter === null || o.levels.includes(levelFilter)),
    ),
    [colorFilter, levelFilter],
  )

  const selected: Opening | null = selectedId
    ? (OPENINGS.find((o) => o.id === selectedId) ?? null)
    : null

  function selectOpening(id: string) {
    setSelectedId(id)
    setMoveIndex(0)
  }

  function handleColorFilter(c: 'white' | 'black') {
    setColorFilter(c)
    setSelectedId(null)
    setMoveIndex(0)
  }

  const fen = useMemo(() => {
    if (!selected) return 'start'
    return computeFenAtIndex(selected.moves, moveIndex)
  }, [selected, moveIndex])

  const lastMove = useMemo(() => {
    if (!selected) return null
    return computeLastMove(selected.moves, moveIndex)
  }, [selected, moveIndex])

  const customSquareStyles = useMemo(() => {
    if (!lastMove) return {}
    const highlight = { backgroundColor: 'rgba(255, 255, 100, 0.35)' }
    return { [lastMove.from]: highlight, [lastMove.to]: highlight }
  }, [lastMove])

  const maxIndex = selected ? selected.moves.length : 0
  const tokens = selected ? buildMoveTokens(selected.moves) : []

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left panel: filter + list ─────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-700 overflow-hidden">

        {/* Color toggle */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            {(['white', 'black'] as const).map((c) => (
              <button
                key={c}
                onClick={() => handleColorFilter(c)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                  colorFilter === c
                    ? 'bg-brand text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {c === 'white' ? '♔ White' : '♚ Black'}
              </button>
            ))}
          </div>
        </div>

        {/* Level filters */}
        <div className="px-3 py-2.5 border-b border-gray-700 flex flex-wrap gap-1.5">
          <button
            onClick={() => setLevelFilter(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              levelFilter === null
                ? 'bg-brand text-white border-brand'
                : 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white'
            }`}
          >
            All
          </button>
          {ALL_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(levelFilter === lvl ? null : lvl)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                levelFilter === lvl
                  ? LEVEL_COLORS[lvl]
                  : 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white'
              }`}
            >
              {LEVEL_LABELS[lvl]}
            </button>
          ))}
        </div>

        {/* Opening list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm italic p-4">No openings match this filter.</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => selectOpening(o.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-700/50 transition-colors ${
                  selectedId === o.id
                    ? 'bg-brand-dark/40 border-l-2 border-l-brand-light'
                    : 'hover:bg-gray-700/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white truncate">{o.name}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    {o.levels.map((lvl) => (
                      <span key={lvl} className={`w-2 h-2 rounded-full ${LEVEL_DOT[lvl]}`} title={LEVEL_LABELS[lvl]} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {o.moves.slice(0, 5).join(' ')}
                  {o.moves.length > 5 ? '…' : ''}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: detail view ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div className="text-5xl select-none">♟</div>
            <p className="text-gray-300 font-semibold">Select an opening</p>
            <p className="text-gray-500 text-sm max-w-xs">
              Choose an opening from the list on the left to see the main line, key ideas, and typical plans.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-bold text-white">{selected.name}</h1>
                {selected.levels.map((lvl) => (
                  <span
                    key={lvl}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${LEVEL_COLORS[lvl]}`}
                  >
                    {LEVEL_LABELS[lvl]}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{selected.description}</p>
            </div>

            {/* Board + move stepper */}
            <div className="flex gap-5 items-start flex-wrap">
              {/* Board */}
              <div className="flex flex-col items-center gap-3">
                <Chessboard
                  position={fen}
                  boardWidth={340}
                  arePiecesDraggable={false}
                  boardOrientation={selected.color === 'black' ? 'black' : 'white'}
                  customSquareStyles={customSquareStyles}
                  customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
                  customDarkSquareStyle={{ backgroundColor: '#7F77DD' }}
                  customLightSquareStyle={{ backgroundColor: '#E8E6F8' }}
                />

                {/* Step controls */}
                <div className="flex items-center gap-1">
                  {[
                    { icon: <FirstIcon />, action: () => setMoveIndex(0), disabled: moveIndex === 0, label: 'First' },
                    { icon: <PrevIcon />, action: () => setMoveIndex((i) => Math.max(0, i - 1)), disabled: moveIndex === 0, label: 'Prev' },
                    { icon: <NextIcon />, action: () => setMoveIndex((i) => Math.min(maxIndex, i + 1)), disabled: moveIndex === maxIndex, label: 'Next' },
                    { icon: <LastIcon />, action: () => setMoveIndex(maxIndex), disabled: moveIndex === maxIndex, label: 'Last' },
                  ].map(({ icon, action, disabled, label }) => (
                    <button
                      key={label}
                      onClick={action}
                      disabled={disabled}
                      title={label}
                      className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Move list */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Main Line</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {tokens.map(({ san, halfMoveIndex }, i) => {
                    const isWhiteMove = i % 2 === 0
                    const moveNumber = Math.floor(i / 2) + 1
                    const isActive = halfMoveIndex === moveIndex
                    const isPast = halfMoveIndex < moveIndex

                    return (
                      <span key={halfMoveIndex} className="inline-flex items-center gap-0.5">
                        {isWhiteMove && (
                          <span className="text-gray-600 text-xs font-mono">{moveNumber}.</span>
                        )}
                        <button
                          onClick={() => setMoveIndex(halfMoveIndex)}
                          className={`px-1.5 py-0.5 rounded text-sm font-mono transition-colors ${
                            isActive
                              ? 'bg-brand text-white font-semibold'
                              : isPast
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                          }`}
                        >
                          {san}
                        </button>
                      </span>
                    )
                  })}
                </div>

                <p className="text-xs text-gray-600 mt-3">
                  Move {moveIndex} of {maxIndex} — click any move or use the arrows to step through the line.
                </p>
              </div>
            </div>

            {/* Key Ideas */}
            <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Ideas</h2>
              <ul className="flex flex-col gap-2">
                {selected.keyIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-light flex-shrink-0 mt-1.5" />
                    <span className="text-sm text-gray-300 leading-snug">{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Typical Plans */}
            <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Typical Plans</h2>
              <ul className="flex flex-col gap-2">
                {selected.plans.map((plan, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-light flex-shrink-0 mt-0.5">→</span>
                    <span className="text-sm text-gray-300 leading-snug">{plan}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Variations */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Variations</h2>
              <div className="grid grid-cols-2 gap-3">
                {selected.variations.map((v, i) => (
                  <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex flex-col gap-1">
                    <p className="text-sm font-semibold text-white">{v.name}</p>
                    <p className="text-xs text-gray-400 font-mono leading-snug">{v.moves}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  )
}
