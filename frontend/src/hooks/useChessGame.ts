import { useCallback, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import type { Color, MoveHistoryEntry } from '../types/chess'

function buildHistory(chess: Chess): MoveHistoryEntry[] {
  const moves = chess.history()
  const entries: MoveHistoryEntry[] = []
  for (let i = 0; i < moves.length; i += 2) {
    entries.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    })
  }
  return entries
}

const INITIAL_FEN = new Chess().fen()

export function useChessGame() {
  const chessRef = useRef(new Chess())
  // fenHistory[0] = starting position, fenHistory[n] = after nth half-move
  const fenHistoryRef = useRef<string[]>([INITIAL_FEN])

  const [viewIndex, setViewIndex] = useState(0)
  const [history, setHistory] = useState<MoveHistoryEntry[]>([])
  const [gameOver, setGameOver] = useState<string | null>(null)
  const [turn, setTurn] = useState<Color>('w')

  const totalHalfMoves = fenHistoryRef.current.length - 1
  const isLive = viewIndex === fenHistoryRef.current.length - 1
  // The FEN shown on the board — follows viewIndex for review, live position otherwise
  const displayFen = fenHistoryRef.current[viewIndex]

  function syncState() {
    const newIdx = fenHistoryRef.current.length - 1
    setViewIndex(newIdx)
    setHistory(buildHistory(chessRef.current))
    setTurn(chessRef.current.turn() as Color)
  }

  const applyPlayerMove = useCallback((from: string, to: string, promotion: string = 'q'): boolean => {
    try {
      chessRef.current.move({ from, to, promotion })
    } catch {
      return false
    }
    fenHistoryRef.current = [...fenHistoryRef.current, chessRef.current.fen()]
    syncState()
    return true
  }, [])

  const applyEngineMove = useCallback((uci: string): void => {
    chessRef.current.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      ...(uci.length === 5 ? { promotion: uci[4] } : {}),
    })
    fenHistoryRef.current = [...fenHistoryRef.current, chessRef.current.fen()]
    syncState()
  }, [])

  // Undo the last player move only (used when backend rejects the move)
  const undoPlayerMove = useCallback(() => {
    chessRef.current.undo()
    fenHistoryRef.current = fenHistoryRef.current.slice(0, -1)
    syncState()
  }, [])

  // Undo 2 half-moves (engine reply + player move) — used for the undo feature
  const undoLastFullMove = useCallback(() => {
    const count = Math.min(2, chessRef.current.history().length)
    for (let i = 0; i < count; i++) chessRef.current.undo()
    fenHistoryRef.current = fenHistoryRef.current.slice(0, -count)
    if (fenHistoryRef.current.length === 0) fenHistoryRef.current = [INITIAL_FEN]
    syncState()
  }, [])

  const reset = useCallback(() => {
    chessRef.current = new Chess()
    fenHistoryRef.current = [INITIAL_FEN]
    setViewIndex(0)
    setHistory([])
    setGameOver(null)
    setTurn('w')
  }, [])

  // Navigation — moves viewIndex without affecting live game state
  const goFirst = useCallback(() => setViewIndex(0), [])
  const goPrev  = useCallback(() => setViewIndex((i) => Math.max(0, i - 1)), [])
  const goNext  = useCallback(() => setViewIndex((i) => Math.min(fenHistoryRef.current.length - 1, i + 1)), [])
  const goLast  = useCallback(() => setViewIndex(fenHistoryRef.current.length - 1), [])

  return {
    displayFen,
    history,
    gameOver,
    turn,
    totalHalfMoves,
    viewIndex,
    isLive,
    setGameOver,
    applyPlayerMove,
    applyEngineMove,
    undoPlayerMove,
    undoLastFullMove,
    reset,
    goFirst,
    goPrev,
    goNext,
    goLast,
  }
}
