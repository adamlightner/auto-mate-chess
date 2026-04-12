import { useCallback, useEffect, useState } from 'react'
import Board from '../components/Board'
import EvalBar from '../components/EvalBar'
import SidePanel from '../components/SidePanel'
import { newGame, postMove, fetchCurrentElo, resignGame, undoMove } from '../api/client'
import { useChessGame } from '../hooks/useChessGame'
import { useWebSocket } from '../hooks/useWebSocket'
import type { WsMessage } from '../types/chess'

function useBoardSize() {
  function compute() {
    const byHeight = window.innerHeight - 32 - 80
    const byWidth = window.innerWidth - 192 - 320 - 20 - 80
    return Math.max(Math.min(byHeight, byWidth), 480)
  }
  const [size, setSize] = useState(compute)
  useEffect(() => {
    function update() { setSize(compute()) }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

export default function Play() {
  const {
    displayFen, history, gameOver, turn,
    totalHalfMoves, viewIndex, isLive,
    setGameOver,
    applyPlayerMove, applyEngineMove, undoPlayerMove, undoLastFullMove,
    reset, goFirst, goPrev, goNext, goLast,
  } = useChessGame()

  const [gameId, setGameId] = useState<string | null>(null)
  const [isEngineTurn, setIsEngineTurn] = useState(false)
  const [evalCp, setEvalCp] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [engineElo, setEngineElo] = useState(1320)
  const [currentElo, setCurrentElo] = useState(1200)
  const [eloDelta, setEloDelta] = useState<number | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  const boardSize = useBoardSize()

  async function refreshElo() {
    const elo = await fetchCurrentElo()
    setCurrentElo(elo)
  }

  useEffect(() => { refreshElo() }, [])

  const onWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'eval_update') {
      setIsAnalyzing(true)
      if (msg.score_cp !== null) setEvalCp(msg.score_cp)
    } else if (msg.type === 'eval_done') {
      setIsAnalyzing(false)
      if (msg.score_cp !== null) setEvalCp(msg.score_cp)
    }
  }, [])

  const { send } = useWebSocket(gameId, onWsMessage)

  const handleStartGame = useCallback(async () => {
    reset()
    setEvalCp(0)
    setIsAnalyzing(false)
    setIsEngineTurn(false)
    setEloDelta(null)
    setLastMove(null)
    setGameId(null)
    try {
      const res = await newGame(engineElo)
      setGameId(res.game_id)
      setBackendError(null)
    } catch {
      setBackendError('Cannot reach the backend. Is the server running?')
    }
  }, [engineElo, reset])

  const handleMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!gameId || isEngineTurn || gameOver || !isLive) return false
      if (!applyPlayerMove(from, to, promotion)) return false

      setLastMove({ from, to })
      setIsEngineTurn(true)
      postMove(gameId, from, to, promotion)
        .then((res) => {
          if (res.engine_move) {
            applyEngineMove(res.engine_move.uci)
            setLastMove({
              from: res.engine_move.uci.slice(0, 2),
              to: res.engine_move.uci.slice(2, 4),
            })
          }
          if (res.game_over) {
            setGameOver(res.game_over as string)
            setEloDelta(res.elo_delta)
            refreshElo()
          }
          if (!res.game_over) {
            setIsAnalyzing(true)
            send({ type: 'analyze', fen: res.fen })
          }
        })
        .catch((err) => {
          console.error('Move failed:', err)
          undoPlayerMove()
        })
        .finally(() => setIsEngineTurn(false))

      return true
    },
    [gameId, isEngineTurn, gameOver, isLive, applyPlayerMove, undoPlayerMove, applyEngineMove, setGameOver, send],
  )

  const handleResign = useCallback(async () => {
    if (!gameId || gameOver || isEngineTurn) return
    const res = await resignGame(gameId)
    setGameOver('resigned')
    setEloDelta(res.elo_delta)
    refreshElo()
  }, [gameId, gameOver, isEngineTurn, setGameOver])

  const handleUndo = useCallback(async () => {
    if (!gameId || isEngineTurn || totalHalfMoves < 2) return
    await undoMove(gameId)
    undoLastFullMove()
    setLastMove(null)
  }, [gameId, isEngineTurn, totalHalfMoves, undoLastFullMove])

  const canUndo = !isEngineTurn && !gameOver && totalHalfMoves >= 2

  if (backendError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-6 py-4 text-sm">
          {backendError}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center gap-4 p-4 h-full">

      {/* Eval bar */}
      <div className="flex flex-col justify-center" style={{ height: boardSize + 80 }}>
        <EvalBar scoreCp={evalCp} isAnalyzing={isAnalyzing} height={boardSize} />
      </div>

      {/* Board area with player strips */}
      <div className="flex flex-col" style={{ width: boardSize }}>
        <div className="flex items-center justify-between px-2 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">B</div>
            <span className="text-sm font-medium text-gray-200">Stockfish</span>
          </div>
          <span className="text-sm text-gray-400 font-mono">{engineElo}</span>
        </div>

        <Board
          fen={displayFen}
          onMove={handleMove}
          disabled={!!gameOver || isEngineTurn || !isLive || !gameId}
          boardWidth={boardSize}
          lastMove={lastMove}
        />

        <div className="flex items-center justify-between px-2 py-2 bg-gray-800 rounded-b-lg border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-dark flex items-center justify-center text-xs font-bold text-white">Y</div>
            <span className="text-sm font-medium text-gray-200">You</span>
          </div>
          <span className="text-sm text-gray-400 font-mono">{currentElo}</span>
        </div>
      </div>

      {/* Side panel */}
      <div className="flex flex-col" style={{ width: 320, height: boardSize + 80 }}>
        <SidePanel
          gameId={gameId}
          history={history}
          gameOver={gameOver}
          turn={turn}
          isEngineTurn={isEngineTurn}
          eloDelta={eloDelta}
          currentElo={currentElo}
          engineElo={engineElo}
          totalHalfMoves={totalHalfMoves}
          viewIndex={viewIndex}
          isLive={isLive}
          canUndo={canUndo}
          onEloChange={setEngineElo}
          onStart={handleStartGame}
          onGoFirst={goFirst}
          onGoPrev={goPrev}
          onGoNext={goNext}
          onGoLast={goLast}
          onUndo={handleUndo}
          onResign={handleResign}
        />
      </div>

    </div>
  )
}
