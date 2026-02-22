from ast import TypeVar
from typing import Any, Generic, Literal, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone

from pydantic import BaseModel, Field


WebSocketMessageTypes = Literal[
    "CREATE", "DELETE", 
    "BOOTUP_START", "BOOTUP_SUCCESS", "BOOTUP_FAIL", 
    "SHUTDOWN_START", "SHUTDOWN_SUCCESS", "SHUTDOWN_FAIL", 
    "DATA_STATIC", 
    "DATA_DYNAMIC", "DATA_DYNAMIC_DISKS", "DATA_DYNAMIC_CONNECTIONS"
]
    
class WebSocketMessage(BaseModel):
    uuid: UUID = Field(default_factory=uuid4)
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    type: WebSocketMessageTypes
    body: Any

class WebSocketMessageUuidsBody(BaseModel):
    uuids: list[UUID]

class WebSocketMessageBaseBody(BaseModel):
    uuid: UUID
    error: str | None = None 