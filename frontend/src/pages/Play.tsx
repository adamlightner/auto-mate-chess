import { useCallback, useEffect, useState } from 'react'
import Board from '../components/Board'
import EvalBar from '../components/EvalBar'
import SidePanel from '../components/SidePanel'
import GameOverModal from '../components/GameOverModal'
import NewGameModal from '../components/NewGameModal'
import CapturedPieces from '../components/CapturedPieces'
import { newGame, postMove, fetchCurrentElo, resignGame, undoMove } from '../api/client'
import { useChessGame } from '../hooks/useChessGame'
import { useWebSocket } from '../hooks/useWebSocket'
import { useSound } from '../hooks/useSound'
import type { WsMessage } from '../types/chess'

function useBoardSize() {
  function compute() {
    const byHeight = window.innerHeight - 32 - 80
    const byWidth = window.innerWidth - 224 - 320 - 20 - 80
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

function resolveColor(choice: 'white' | 'black' | 'random'): 'white' | 'black' {
  if (choice === 'random') return Math.random() < 0.5 ? 'white' : 'black'
  return choice
}

export default function Play() {
  const {
    displayFen, history, gameOver, turn,
    totalHalfMoves, viewIndex, isLive,
    setGameOver,
    applyPlayerMove, applyEngineMove, addClassification,
    undoPlayerMove, undoLastFullMove,
    reset, goFirst, goPrev, goNext, goLast,
  } = useChessGame()

  const [gameId, setGameId] = useState<string | null>(null)
  const [isEngineTurn, setIsEngineTurn] = useState(false)
  const [evalCp, setEvalCp] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [engineElo, setEngineElo] = useState(1320)
  const [playerColorChoice, setPlayerColorChoice] = useState<'white' | 'black' | 'random'>('white')
  const [activePlayerColor, setActivePlayerColor] = useState<'white' | 'black'>('white')
  const [currentElo, setCurrentElo] = useState(1200)
  const [eloDelta, setEloDelta] = useState<number | null>(null)
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [showNewGameModal, setShowNewGameModal] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showClassifications, setShowClassifications] = useState(true)

  const { play: playSound } = useSound(soundEnabled)
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

  const handleStartGame = useCallback(async (overrideElo?: number, overrideColor?: 'white' | 'black' | 'random') => {
    const elo = overrideElo ?? engineElo
    const colorChoice = overrideColor ?? playerColorChoice
    const resolvedColor = resolveColor(colorChoice)

    reset()
    setEvalCp(0)
    setIsAnalyzing(false)
    setIsEngineTurn(false)
    setEloDelta(null)
    setGameResult(null)
    setLastMove(null)
    setGameId(null)
    setShowGameOverModal(false)
    setShowNewGameModal(false)
    setActivePlayerColor(resolvedColor)

    try {
      const res = await newGame(elo, resolvedColor)
      setGameId(res.game_id)
      setBackendError(null)

      // If player is black, engine has already made its first move
      if (res.engine_move) {
        applyEngineMove(res.engine_move.uci)
        setLastMove({
          from: res.engine_move.uci.slice(0, 2),
          to: res.engine_move.uci.slice(2, 4),
        })
      }
    } catch {
      setBackendError('Cannot reach the backend. Is the server running?')
    }
  }, [engineElo, playerColorChoice, reset, applyEngineMove])

  const handleMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!gameId || isEngineTurn || gameOver || !isLive) return false
      const moveIndex = applyPlayerMove(from, to, promotion)
      if (moveIndex === false) return false

      setLastMove({ from, to })
      setIsEngineTurn(true)
      postMove(gameId, from, to, promotion, showClassifications)
        .then((res) => {
          addClassification(moveIndex, res.move_classification)

          // Determine sound to play
          const isCapture = res.player_move.san.includes('x')
          const isCheck = res.player_move.san.includes('+') || res.player_move.san.includes('#')

          if (res.engine_move) {
            applyEngineMove(res.engine_move.uci)
            setLastMove({
              from: res.engine_move.uci.slice(0, 2),
              to: res.engine_move.uci.slice(2, 4),
            })
            const engineIsCapture = res.engine_move.san.includes('x')
            const engineIsCheck = res.engine_move.san.includes('+') || res.engine_move.san.includes('#')
            if (engineIsCheck) playSound('check')
            else if (engineIsCapture) playSound('capture')
            else playSound('move')
          } else {
            if (isCheck) playSound('check')
            else if (isCapture) playSound('capture')
            else playSound('move')
          }

          if (res.game_over) {
            setGameOver(res.game_over as string)
            setGameResult(res.result)
            setEloDelta(res.elo_delta)
            setShowGameOverModal(true)
            playSound('gameOver')
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
    [gameId, isEngineTurn, gameOver, isLive, showClassifications, applyPlayerMove, addClassification, undoPlayerMove, applyEngineMove, setGameOver, send, playSound],
  )

  const handleResign = useCallback(async () => {
    if (!gameId || gameOver || isEngineTurn) return
    const res = await resignGame(gameId)
    setGameOver('resigned')
    setGameResult('loss')
    setEloDelta(res.elo_delta)
    setShowGameOverModal(true)
    playSound('gameOver')
    refreshElo()
  }, [gameId, gameOver, isEngineTurn, setGameOver, playSound])

  const handleUndo = useCallback(async () => {
    if (!gameId || isEngineTurn || totalHalfMoves < 2) return
    await undoMove(gameId)
    undoLastFullMove()
    setLastMove(null)
  }, [gameId, isEngineTurn, totalHalfMoves, undoLastFullMove])

  const canUndo = !isEngineTurn && !gameOver && totalHalfMoves >= 2

  // Player strip labels — top strip is always the opponent
  const playerStrip = {
    top: {
      label: 'Stockfish',
      elo: engineElo,
      initial: 'S',
      color: 'bg-gray-600',
    },
    bottom: {
      label: 'You',
      elo: currentElo,
      initial: 'Y',
      color: 'bg-brand-dark',
    },
  }

  if (backendError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-6 py-4 text-sm">
          {backendError}
        </div>
      </div>
    )
  }

  const engineColor = activePlayerColor === 'white' ? 'black' : 'white'

  return (
    <div className="relative flex items-center justify-center gap-4 p-4 h-full">

      {/* Game over modal */}
      {showGameOverModal && gameOver && gameResult && (
        <GameOverModal
          gameOver={gameOver}
          gameResult={gameResult}
          eloDelta={eloDelta}
          currentElo={currentElo}
          onReview={() => setShowGameOverModal(false)}
          onRematch={() => handleStartGame(engineElo, playerColorChoice)}
          onNewBot={() => {
            setShowGameOverModal(false)
            setShowNewGameModal(true)
          }}
        />
      )}

      {/* New game modal (for "New Bot" flow) */}
      {showNewGameModal && (
        <NewGameModal
          engineElo={engineElo}
          playerColor={playerColorChoice}
          onEloChange={setEngineElo}
          onColorChange={setPlayerColorChoice}
          onStart={() => handleStartGame()}
        />
      )}

      {/* Eval bar */}
      <div className="flex flex-col justify-center" style={{ height: boardSize + 80 }}>
        <EvalBar scoreCp={evalCp} isAnalyzing={isAnalyzing} height={boardSize} />
      </div>

      {/* Board area with player strips */}
      <div className="flex flex-col" style={{ width: boardSize }}>

        {/* Top strip — opponent */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-gray-800 rounded-t-lg border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full ${playerStrip.top.color} flex items-center justify-center text-xs font-bold text-white`}>
              {playerStrip.top.initial}
            </div>
            <span className="text-sm font-medium text-gray-200">{playerStrip.top.label}</span>
            <CapturedPieces fen={displayFen} side={engineColor} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-mono">{playerStrip.top.elo}</span>
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
              className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        <Board
          fen={displayFen}
          onMove={handleMove}
          disabled={!!gameOver || isEngineTurn || !isLive || !gameId}
          boardWidth={boardSize}
          lastMove={lastMove}
          boardOrientation={activePlayerColor}
        />

        {/* Bottom strip — player */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-gray-800 rounded-b-lg border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full ${playerStrip.bottom.color} flex items-center justify-center text-xs font-bold text-white`}>
              {playerStrip.bottom.initial}
            </div>
            <span className="text-sm font-medium text-gray-200">{playerStrip.bottom.label}</span>
            <CapturedPieces fen={displayFen} side={activePlayerColor} />
          </div>
          <span className="text-sm text-gray-400 font-mono">{playerStrip.bottom.elo}</span>
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
          playerColor={playerColorChoice}
          totalHalfMoves={totalHalfMoves}
          viewIndex={viewIndex}
          isLive={isLive}
          canUndo={canUndo}
          showClassifications={showClassifications}
          onEloChange={setEngineElo}
          onColorChange={setPlayerColorChoice}
          onStart={() => handleStartGame()}
          onGoFirst={goFirst}
          onGoPrev={goPrev}
          onGoNext={goNext}
          onGoLast={goLast}
          onUndo={handleUndo}
          onResign={handleResign}
          onToggleClassifications={() => setShowClassifications((v) => !v)}
        />
      </div>

    </div>
  )
}
