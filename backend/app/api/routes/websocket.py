from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time channel matching the frontend's wsClient contract.

    Broadcasts ISSUE_CREATED / ISSUE_UPDATED / ISSUE_ASSIGNED /
    MESSAGE_CREATED / NOTIFICATION events as JSON:
    `{"event": "...", "payload": {...}}`. Auth for the socket itself
    can be layered on later (e.g. a `?token=` query param verified the
    same way as get_current_user) — kept open here to match Chunk 1's
    frontend, which does not yet send one.
    """
    await manager.connect(websocket)
    try:
        while True:
            # The server is broadcast-only for now; drain any client pings.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
