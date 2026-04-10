import { useCallback, useEffect, useRef } from 'react'
import type { WsMessage } from '../types/chess'

export function useWebSocket(gameId: string | null, onMessage: (msg: WsMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  // Keep a stable ref to onMessage so we don't re-connect when the callback changes
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!gameId) return
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/engine/${gameId}`)
    ws.onmessage = (e: MessageEvent) => {
      try {
        onMessageRef.current(JSON.parse(e.data) as WsMessage)
      } catch {
        // ignore malformed messages
      }
    }
    wsRef.current = ws
    return () => ws.close()
  }, [gameId])

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}
