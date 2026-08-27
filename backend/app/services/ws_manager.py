"""Minimal WebSocket broadcast hub.

Matches the frontend's `wsClient` event contract (ISSUE_CREATED,
ISSUE_UPDATED, ISSUE_ASSIGNED, MESSAGE_CREATED, NOTIFICATION). Any
mutation in the CRUD layer calls `manager.broadcast(...)` after commit
so every connected browser tab updates without a page reload.
"""
import json
import logging

from fastapi import WebSocket

logger = logging.getLogger("itflow.ws")


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, event: str, payload: dict) -> None:
        message = json.dumps({"event": event, "payload": payload})
        stale: list[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:  # noqa: BLE001
                stale.append(ws)
        for ws in stale:
            self.disconnect(ws)


manager = ConnectionManager()
