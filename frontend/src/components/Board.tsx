import { useState, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { CSSProperties } from 'react'
import { useSettings } from '../contexts/SettingsContext'

const PIECE_CODES = ['wP', 'wR', 'wN', 'wB', 'wQ', 'wK', 'bP', 'bR', 'bN', 'bB', 'bQ', 'bK']

function buildCustomPieces(pieceSet: string) {
  if (pieceSet === 'cburnett') return undefined
  const pieces: Record<string, ({ squareWidth }: { squareWidth: number }) => JSX.Element> = {}
  for (const code of PIECE_CODES) {
    const url = `https://lichess1.org/assets/piece/${pieceSet}/${code}.svg`
    pieces[code] = ({ squareWidth }) => (
      <img src={url} width={squareWidth} height={squareWidth} draggable={false} alt={code} />
    )
  }
  return pieces
}

interface BoardProps {
  fen: string
  onMove: (from: string, to: string) => boolean
  disabled?: boolean
  boardWidth?: number
  lastMove?: { from: string; to: string } | null
}

export default function Board({ fen, onMove, disabled = false, boardWidth = 560, lastMove }: BoardProps) {
  const { pieceSet } = useSettings()
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalTargets, setLegalTargets] = useState<string[]>([])

  function selectSquare(square: string) {
    const chess = new Chess(fen)
    const piece = chess.get(square as Parameters<typeof chess.get>[0])
    if (piece && piece.color === chess.turn()) {
      const moves = chess.moves({ square: square as Parameters<typeof chess.get>[0], verbose: true })
      setSelectedSquare(square)
      setLegalTargets(moves.map((m) => m.to))
    } else {
      setSelectedSquare(null)
      setLegalTargets([])
    }
  }

  function clearSelection() {
    setSelectedSquare(null)
    setLegalTargets([])
  }

  function onSquareClick(square: string) {
    if (disabled) return

    if (selectedSquare) {
      if (square === selectedSquare) {
        clearSelection()
        return
      }
      if (legalTargets.includes(square)) {
        const ok = onMove(selectedSquare, square)
        clearSelection()
        if (ok) return
      }
      // Re-select if clicking another friendly piece
      selectSquare(square)
      return
    }

    selectSquare(square)
  }

  function onPieceDragBegin(_piece: string, square: string) {
    if (disabled) return
    selectSquare(square)
  }

  function onPieceDrop(source: string, target: string) {
    if (disabled) return false
    clearSelection()
    return onMove(source, target)
  }

  const customSquareStyles = useMemo<Record<string, CSSProperties>>(() => {
    const styles: Record<string, CSSProperties> = {}

    // Last move highlight
    if (lastMove) {
      const highlight: CSSProperties = { backgroundColor: 'rgba(255, 255, 100, 0.35)' }
      styles[lastMove.from] = highlight
      styles[lastMove.to] = highlight
    }

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor: 'rgba(20, 85, 255, 0.35)',
      }
    }

    // Legal move hints
    if (legalTargets.length) {
      const chess = new Chess(fen)
      for (const sq of legalTargets) {
        const occupied = !!chess.get(sq as Parameters<typeof chess.get>[0])
        styles[sq] = {
          ...styles[sq],
          background: occupied
            // Capture: ring around the existing piece
            ? 'radial-gradient(circle, transparent 58%, rgba(0,0,0,0.25) 58%)'
            // Empty square: small centre dot
            : 'radial-gradient(circle, rgba(0,0,0,0.25) 26%, transparent 26%)',
        }
      }
    }

    return styles
  }, [fen, selectedSquare, legalTargets, lastMove])

  return (
    <div style={{ width: boardWidth }}>
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDragEnd={clearSelection}
        boardWidth={boardWidth}
        customPieces={buildCustomPieces(pieceSet)}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
        customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
      />
    </div>
  )
}
