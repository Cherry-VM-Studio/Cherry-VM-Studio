import asyncio
from uuid import UUID
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from modules.websockets.websocket_handler import WebSocketHandler


class _WebSocketManager:
    def __init__(self):
        self._connections: dict[UUID, set["WebSocketHandler"]] = dict()
        self._lock = asyncio.Lock()

    async def register(self, user_uuid: UUID, handler: "WebSocketHandler"):
        async with self._lock:
            self._connections.setdefault(user_uuid, set()).add(handler)

    async def unregister(self, user_uuid: UUID, handler: "WebSocketHandler"):
        async with self._lock:
            if user_uuid in self._connections:
                self._connections[user_uuid].discard(handler)
                if not self._connections[user_uuid]:
                    del self._connections[user_uuid]

    async def disconnect_user(self, user_uuid: UUID, code: int = 4403, reason: str = "Account deleted"):
        async with self._lock:
            handlers = list(self._connections.get(user_uuid, []))

        for handler in handlers:
            await handler.close(code, reason)
   
            
GlobalWebSocketManager = _WebSocketManager()

__all__ = ["GlobalWebSocketManager"]