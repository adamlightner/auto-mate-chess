export type Color = 'w' | 'b'

export interface MoveHistoryEntry {
  moveNumber: number
  white?: string
  black?: string
}

export interface MoveResponse {
  player_move: { san: string; uci: string }
  engine_move: { san: string; uci: string } | null
  fen: string
  turn: Color
  game_over: string | null
  elo_delta: number | null
}

export type WsMessage =
  | {
      type: 'eval_update'
      depth: number
      score_cp: number | null
      score_mate: number | null
      best_move_uci: string | null
      pv: string[]
    }
  | {
      type: 'eval_done'
      depth: number
      score_cp: number | null
      score_mate: number | null
      best_move_uci: string | null
    }
  | { type: 'error'; code: string; message: string }
