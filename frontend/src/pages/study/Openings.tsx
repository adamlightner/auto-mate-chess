import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import {
  OPENINGS,
  LEVEL_LABELS,
  LEVEL_COLORS,
  LEVEL_DOT,
  STRATEGY_LABELS,
} from '../../data/openings'
import type { Level, Opening, Strategy } from '../../data/openings'

// ── Board area size via ResizeObserver ────────────────────────────────────────
// Measures the actual container and sizes the board to fill it, leaving room
// for the step controls + move tokens below (~88px).

const CONTROLS_H = 88

function useBoardAreaSize(ref: React.RefObject<HTMLDivElement>) {
  const [size, setSize] = useState(400)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const compute = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize(Math.max(Math.floor(Math.min(width - 8, height - CONTROLS_H)), 200))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

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

// ── Strategy config ───────────────────────────────────────────────────────────

const WHITE_STRATEGIES: Strategy[] = ['e4', 'd4']
const BLACK_STRATEGIES: Strategy[] = ['vs-e4', 'vs-d4']

// ── Component ─────────────────────────────────────────────────────────────────

export default function Openings() {
  const boardAreaRef = useRef<HTMLDivElement>(null)
  const boardSize = useBoardAreaSize(boardAreaRef)

  const [colorFilter, setColorFilter] = useState<'white' | 'black'>('white')
  const [strategyFilter, setStrategyFilter] = useState<Strategy>('e4')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [moveIndex, setMoveIndex] = useState(0)
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)

  const strategies = colorFilter === 'white' ? WHITE_STRATEGIES : BLACK_STRATEGIES

  const filtered = useMemo(() =>
    OPENINGS.filter((o) => o.color === colorFilter && o.strategy === strategyFilter),
    [colorFilter, strategyFilter],
  )

  const selected: Opening | null = selectedId
    ? (OPENINGS.find((o) => o.id === selectedId) ?? null)
    : null

  function selectOpening(id: string) {
    setSelectedId(id)
    setMoveIndex(0)
    setSelectedVariation(null)
  }

  function handleColorFilter(c: 'white' | 'black') {
    setColorFilter(c)
    setStrategyFilter(c === 'white' ? 'e4' : 'vs-e4')
    setSelectedId(null)
    setMoveIndex(0)
    setSelectedVariation(null)
  }

  function handleStrategyFilter(s: Strategy) {
    setStrategyFilter(s)
    setSelectedId(null)
    setMoveIndex(0)
    setSelectedVariation(null)
  }

  function handleVariationClick(index: number) {
    if (selectedVariation === index) {
      setSelectedVariation(null)
      setMoveIndex(0)
    } else {
      setSelectedVariation(index)
      setMoveIndex(0)
    }
  }

  const currentMoves = useMemo(() => {
    if (!selected) return []
    if (selectedVariation !== null) return selected.variations[selectedVariation].movesArray
    return selected.moves
  }, [selected, selectedVariation])

  const fen = useMemo(() => {
    if (!selected) return 'start'
    return computeFenAtIndex(currentMoves, moveIndex)
  }, [currentMoves, moveIndex])

  const lastMove = useMemo(() => {
    if (!selected) return null
    return computeLastMove(currentMoves, moveIndex)
  }, [currentMoves, moveIndex])

  const customSquareStyles = useMemo(() => {
    if (!lastMove) return {}
    const highlight = { backgroundColor: 'rgba(255, 255, 100, 0.35)' }
    return { [lastMove.from]: highlight, [lastMove.to]: highlight }
  }, [lastMove])

  const maxIndex = currentMoves.length

  const tokens = useMemo(() => {
    return currentMoves.map((san, i) => ({ san, halfMoveIndex: i + 1 }))
  }, [currentMoves])

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: Navigator ──────────────────────────────────────────────── */}
      <div className="w-60 flex-shrink-0 flex flex-col border-r border-gray-700 overflow-hidden">

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

        {/* Strategy filter */}
        <div className="px-3 py-2.5 border-b border-gray-700 flex gap-1.5">
          {strategies.map((s) => (
            <button
              key={s}
              onClick={() => handleStrategyFilter(s)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                strategyFilter === s
                  ? 'bg-brand-dark/60 text-brand-light border-brand-dark'
                  : 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:border-gray-500'
              }`}
            >
              {STRATEGY_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Opening list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm italic p-4">No openings match.</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => selectOpening(o.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-700/50 transition-colors ${
                  selectedId === o.id
                    ? 'bg-brand-dark/40 border-l-2 border-l-brand-light'
                    : 'hover:bg-gray-700/40 border-l-2 border-l-transparent'
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
                <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                  {o.moves.slice(0, 5).join(' ')}{o.moves.length > 5 ? '…' : ''}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Center ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Title Banner */}
        <div className="flex-shrink-0 border-b border-gray-700 px-6 py-4 min-h-[76px] flex items-center">
          {selected ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white leading-tight">
                  {selectedVariation !== null
                    ? selected.variations[selectedVariation].name
                    : selected.name}
                </h1>
                {selectedVariation !== null ? (
                  <span className="text-xs text-brand-light border border-brand-dark/60 bg-brand-dark/20 px-2 py-0.5 rounded-full">
                    Variation of {selected.name}
                  </span>
                ) : selected.levels.map((lvl) => (
                  <span key={lvl} className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${LEVEL_COLORS[lvl as Level]}`}>
                    {LEVEL_LABELS[lvl as Level]}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-1 leading-snug line-clamp-2">
                {selectedVariation !== null
                  ? selected.variations[selectedVariation].moves
                  : selected.description}
              </p>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white">Opening Library</h1>
              <p className="text-sm text-gray-400 mt-1">
                Choose a color and strategy on the left, then select an opening to walk through its main line.
              </p>
            </div>
          )}
        </div>

        {/* Board area — outer measured by ResizeObserver; inner pinned to center via translate */}
        <div ref={boardAreaRef} className="flex-1 min-h-0 relative overflow-hidden">
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Chessboard
            position={fen}
            boardWidth={boardSize}
            arePiecesDraggable={false}
            boardOrientation={selected?.color === 'black' ? 'black' : 'white'}
            customSquareStyles={customSquareStyles}
            customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
            customDarkSquareStyle={{ backgroundColor: '#7F77DD' }}
            customLightSquareStyle={{ backgroundColor: '#E8E6F8' }}
          />

          {selected ? (
            <>
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

              {/* Move tokens */}
              <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center" style={{ maxWidth: boardSize }}>
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
            </>
          ) : (
            <p className="text-xs text-gray-600">Select an opening to step through the main line.</p>
          )}
        </div>
        </div>

        {/* Bottom: Variations / Gambits */}
        <div className="flex-shrink-0 border-t border-gray-700 bg-gray-800/50">
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Variations &amp; Gambits</p>
            {selectedVariation !== null && (
              <button
                onClick={() => { setSelectedVariation(null); setMoveIndex(0) }}
                className="text-xs text-brand-light hover:text-white border border-brand-dark/60 bg-brand-dark/20 px-2 py-0.5 rounded-full transition-colors"
              >
                ← Main Line
              </button>
            )}
          </div>
          {selected ? (
            <div className="flex gap-2.5 overflow-x-auto px-4 pb-4 pt-1">
              {selected.variations.map((v, i) => {
                const isActive = selectedVariation === i
                return (
                  <button
                    key={i}
                    onClick={() => handleVariationClick(i)}
                    className={`flex-shrink-0 w-52 rounded-xl p-3 flex flex-col gap-1 text-left transition-all border ${
                      isActive
                        ? 'bg-brand-dark/40 border-brand-light/60 ring-1 ring-brand-light/30'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-700/60'
                    }`}
                  >
                    <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-brand-lighter' : 'text-white'}`}>{v.name}</p>
                    <p className="text-xs text-gray-400 font-mono leading-snug">{v.moves}</p>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto px-4 pb-4 pt-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-52 bg-gray-800/60 border border-gray-700/50 rounded-xl p-3 flex flex-col gap-2">
                  <div className="h-3 w-32 bg-gray-700/60 rounded" />
                  <div className="h-2.5 w-40 bg-gray-700/40 rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Key Ideas, Plans, Tactics ─────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-l border-gray-700 overflow-y-auto">
        {selected ? (
          <div className="flex flex-col divide-y divide-gray-700">

            {/* Key Ideas */}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-light inline-block" />
                Key Ideas
              </h2>
              <ul className="flex flex-col gap-2">
                {selected.keyIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-light flex-shrink-0 mt-1.5" />
                    <span className="text-sm text-gray-300 leading-snug">{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plans */}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-brand-light">→</span>
                Plans
              </h2>
              <ul className="flex flex-col gap-2">
                {selected.plans.map((plan, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-light flex-shrink-0 mt-0.5 text-sm">→</span>
                    <span className="text-sm text-gray-300 leading-snug">{plan}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tactics */}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-yellow-500">⚡</span>
                Tactics
              </h2>
              <ul className="flex flex-col gap-2">
                {selected.tactics.map((tactic, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-yellow-600 flex-shrink-0 text-xs mt-1 font-bold">{i + 1}.</span>
                    <span className="text-sm text-gray-300 leading-snug">{tactic}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-700">

            {/* Key Ideas placeholder */}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />
                Key Ideas
              </h2>
              <p className="text-sm text-gray-600 leading-snug">
                The core strategic concepts that define this opening's character and goals.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 flex-shrink-0 mt-1.5" />
                    <div className={`h-2.5 bg-gray-700/50 rounded ${i === 0 ? 'w-full' : i === 1 ? 'w-4/5' : 'w-3/5'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Plans placeholder */}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-gray-600">→</span>
                Plans
              </h2>
              <p className="text-sm text-gray-600 leading-snug">
                Typical middlegame plans and long-term strategic goals for both sides.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gray-700 flex-shrink-0 text-sm">→</span>
                    <div className={`h-2.5 bg-gray-700/50 rounded ${i === 0 ? 'w-full' : i === 1 ? 'w-3/4' : 'w-4/5'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Tactics placeholder */}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-gray-600">⚡</span>
                Tactics
              </h2>
              <p className="text-sm text-gray-600 leading-snug">
                Common tactical motifs and patterns to watch for in the opening and early middlegame.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gray-700 flex-shrink-0 text-xs mt-1 font-bold">{i + 1}.</span>
                    <div className={`h-2.5 bg-gray-700/50 rounded ${i === 0 ? 'w-4/5' : i === 1 ? 'w-full' : 'w-3/5'}`} />
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
