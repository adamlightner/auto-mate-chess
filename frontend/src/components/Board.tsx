import { useState, useMemo, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { CSSProperties } from 'react'
import { useSettings } from '../contexts/SettingsContext'

const PIECE_CODES = ['wP', 'wR', 'wN', 'wB', 'wQ', 'wK', 'bP', 'bR', 'bN', 'bB', 'bQ', 'bK']

const AUTOMATE_PIECES: Partial<Record<string, string>> = {
  wP: '/pieces/wP.svg',
  bP: '/pieces/bP.svg',
  wR: '/pieces/wR.svg',
  bR: '/pieces/bR.svg',
}

function buildCustomPieces(pieceSet: string) {
  if (pieceSet === 'cburnett') return undefined
  const pieces: Record<string, ({ squareWidth }: { squareWidth: number }) => JSX.Element> = {}
  for (const code of PIECE_CODES) {
    const url = pieceSet === 'automate' && AUTOMATE_PIECES[code]
      ? AUTOMATE_PIECES[code]!
      : `https://lichess1.org/assets/piece/${pieceSet === 'automate' ? 'cburnett' : pieceSet}/${code}.svg`
    pieces[code] = ({ squareWidth }) => (
      <img src={url} width={squareWidth} height={squareWidth} draggable={false} alt={code} />
    )
  }
  return pieces
}

interface BoardProps {
  fen: string
  onMove: (from: string, to: string, promotion?: string) => boolean
  disabled?: boolean
  boardWidth?: number
  lastMove?: { from: string; to: string } | null
  boardOrientation?: 'white' | 'black'
}

export default function Board({ fen, onMove, disabled = false, boardWidth = 560, lastMove, boardOrientation = 'white' }: BoardProps) {
  const { pieceSet } = useSettings()
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalTargets, setLegalTargets] = useState<string[]>([])
  const pendingPromotion = useRef<{ from: string; to: string } | null>(null)

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
        if (isPromotionMove(selectedSquare, square)) {
          pendingPromotion.current = { from: selectedSquare, to: square }
          // Return without clearing — Chessboard will show the dialog
          return
        }
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

  function isPromotionMove(from: string, to: string): boolean {
    const chess = new Chess(fen)
    const piece = chess.get(from as Parameters<typeof chess.get>[0])
    if (!piece || piece.type !== 'p') return false
    const toRank = to[1]
    return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1')
  }

  function onPieceDrop(source: string, target: string) {
    if (disabled) return false
    clearSelection()
    if (isPromotionMove(source, target)) {
      // Let the built-in promotion dialog handle it; store the pending move
      pendingPromotion.current = { from: source, to: target }
      return true
    }
    return onMove(source, target)
  }

  function onPromotionPieceSelect(piece?: string, from?: string, to?: string): boolean {
    const f = from ?? pendingPromotion.current?.from
    const t = to ?? pendingPromotion.current?.to
    pendingPromotion.current = null
    if (!f || !t || !piece) return false
    // piece is e.g. 'wQ', 'bR' — extract the lowercase type letter
    const promotion = piece[1].toLowerCase() as 'q' | 'r' | 'b' | 'n'
    return onMove(f, t, promotion)
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
        onPromotionPieceSelect={onPromotionPieceSelect}
        boardWidth={boardWidth}
        boardOrientation={boardOrientation}
        customPieces={buildCustomPieces(pieceSet)}
        customSquareStyles={customSquareStyles}
        customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
        customDarkSquareStyle={{ backgroundColor: '#7F77DD' }}
        customLightSquareStyle={{ backgroundColor: '#E8E6F8' }}
      />
    </div>
  )
}
