import type { MoveResponse } from '../types/chess'

const BASE = '/api'

export async function newGame(
  engineElo?: number,
  playerColor?: 'white' | 'black',
): Promise<{ game_id: string; fen: string; turn: string; engine_move: { san: string; uci: string } | null }> {
  const res = await fetch(`${BASE}/game/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine_elo: engineElo ?? 1320, player_color: playerColor ?? 'white' }),
  })
  if (!res.ok) throw new Error('Failed to create game')
  return res.json()
}

export async function postMove(
  gameId: string,
  from: string,
  to: string,
  promotion?: string,
  classify?: boolean,
): Promise<MoveResponse> {
  const res = await fetch(`${BASE}/game/${gameId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, promotion, classify: classify ?? false }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Move failed' }))
    throw new Error(err.detail ?? 'Move failed')
  }
  return res.json()
}

export interface EloPoint {
  game_id: number
  result: string
  elo_before: number
  elo_after: number
  elo_delta: number
  engine_elo: number
  created_at: string | null
}

export async function fetchEloHistory(): Promise<EloPoint[]> {
  const res = await fetch(`${BASE}/elo/history`)
  if (!res.ok) throw new Error('Failed to fetch ELO history')
  return res.json()
}

export async function resignGame(gameId: string): Promise<{ result: string; elo_delta: number }> {
  const res = await fetch(`${BASE}/game/${gameId}/resign`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to resign')
  return res.json()
}

export async function undoMove(gameId: string): Promise<{ fen: string; undone: number }> {
  const res = await fetch(`${BASE}/game/${gameId}/undo`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to undo')
  return res.json()
}

export async function fetchCurrentElo(): Promise<number> {
  const res = await fetch(`${BASE}/elo/current`)
  if (!res.ok) return 1200
  const data = await res.json()
  return data.elo
}
