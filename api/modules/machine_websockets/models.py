from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel


WebSocketMessageTypes = Literal[
    "CREATE", "DELETE", 
    "BOOTUP_START", "BOOTUP_SUCCESS", "BOOTUP_FAIL", 
    "SHUTDOWN_START", "SHUTDOWN_SUCCESS", "SHUTDOWN_FAIL", 
    "DATA_STATIC", 
    "DATA_DYNAMIC", "DATA_DYNAMIC_DISKS", "DATA_DYNAMIC_CONNECTIONS"
]
    
class WebSocketMessage(BaseModel):
    uuid: UUID = uuid4()
    type: WebSocketMessageTypes
    body: BaseModel | dict 

class WebSocketMessageUuidsBody(BaseModel):
    uuids: list[UUID]

class WebSocketMessageBaseBody(BaseModel):
    uuid: UUID
    error: str | None = None 