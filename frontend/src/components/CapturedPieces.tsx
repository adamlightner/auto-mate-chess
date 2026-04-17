// Displays captured pieces and material advantage for one side.

interface Props {
  fen: string
  side: 'white' | 'black' // which player's captures to show
}

// Starting piece counts (excluding kings — they're never captured)
const START: Record<string, number> = { p: 8, r: 2, n: 2, b: 2, q: 1 }

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

// Unicode symbols: white pieces (showing what was captured from white = black keeps)
const WHITE_SYMBOLS: Record<string, string> = { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕' }
const BLACK_SYMBOLS: Record<string, string> = { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛' }

function parsePieceCounts(fen: string): { white: Record<string, number>; black: Record<string, number> } {
  const position = fen.split(' ')[0]
  const white: Record<string, number> = { p: 0, r: 0, n: 0, b: 0, q: 0 }
  const black: Record<string, number> = { p: 0, r: 0, n: 0, b: 0, q: 0 }

  for (const ch of position) {
    if (ch === '/') continue
    if (ch >= '1' && ch <= '8') continue
    const lower = ch.toLowerCase()
    if (!(lower in white)) continue
    if (ch === ch.toUpperCase()) white[lower]++
    else black[lower]++
  }

  return { white, black }
}

export default function CapturedPieces({ fen, side }: Props) {
  const { white, black } = parsePieceCounts(fen)

  // Pieces captured from the opponent = opponent's start count - opponent's remaining count
  // "side" is the capturing player; opponent is the other side
  const opponent = side === 'white' ? black : white
  const symbols = side === 'white' ? BLACK_SYMBOLS : WHITE_SYMBOLS

  const captured: string[] = []
  let advantage = 0

  for (const type of ['q', 'r', 'b', 'n', 'p'] as const) {
    const opponentStart = START[type]
    const opponentRemaining = opponent[type]
    const count = Math.max(0, opponentStart - opponentRemaining)
    for (let i = 0; i < count; i++) {
      captured.push(symbols[type])
    }
    advantage += count * PIECE_VALUES[type]
  }

  // Subtract opponent's captures for net advantage
  const myPieces = side === 'white' ? white : black
  let opponentAdvantage = 0
  for (const type of ['q', 'r', 'b', 'n', 'p'] as const) {
    const myStart = START[type]
    const myRemaining = myPieces[type]
    opponentAdvantage += Math.max(0, myStart - myRemaining) * PIECE_VALUES[type]
  }

  const netAdvantage = advantage - opponentAdvantage

  if (captured.length === 0 && netAdvantage <= 0) {
    return <div className="h-5" /> // empty spacer to maintain layout
  }

  return (
    <div className="flex items-center gap-1 h-5 min-w-0">
      <span className="text-sm leading-none tracking-tighter text-gray-300 select-none">
        {captured.join('')}
      </span>
      {netAdvantage > 0 && (
        <span className="text-xs text-gray-400 font-mono">+{netAdvantage}</span>
      )}
    </div>
  )
}
