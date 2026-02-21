from ast import TypeVar
from typing import Any, Generic, Literal
from uuid import UUID, uuid4

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
    type: WebSocketMessageTypes
    body: Any

class WebSocketMessageUuidsBody(BaseModel):
    uuids: list[UUID]

class WebSocketMessageBaseBody(BaseModel):
    uuid: UUID
    error: str | None = None 