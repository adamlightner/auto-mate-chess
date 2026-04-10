import asyncio

from fastapi import WebSocket, WebSocketDisconnect

from services.stockfish import stockfish_service
from store import games


async def engine_stream(ws: WebSocket, game_id: str) -> None:
    await ws.accept()
    try:
        while True:
            data = await ws.receive_json()
            if data.get("type") != "analyze":
                continue

            if game_id not in games:
                await ws.send_json({"type": "error", "code": "game_not_found", "message": f"No game: {game_id}"})
                continue

            fen = data.get("fen")
            if not fen:
                continue

            record = games[game_id]

            # Drain any stale items from a previous analysis
            while not record.eval_queue.empty():
                try:
                    record.eval_queue.get_nowait()
                except asyncio.QueueEmpty:
                    break

            # Start analysis in background — it pushes to eval_queue
            asyncio.create_task(stockfish_service.stream_analysis(fen, record.eval_queue))

            # Forward queue items to the client until sentinel (None)
            while True:
                msg = await record.eval_queue.get()
                if msg is None:
                    break
                await ws.send_json(msg)

    except WebSocketDisconnect:
        pass
