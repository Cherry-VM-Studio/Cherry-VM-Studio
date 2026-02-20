import logging
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from typing import Callable, Any
from starlette.websockets import WebSocket
from modules.exceptions import RaisedException
import asyncio

logger = logging.getLogger(__name__)

class Subscription(BaseModel):
    websocket: WebSocket
    machine: UUID
    
    model_config = ConfigDict(arbitrary_types_allowed=True)


class SubscriptionManager(BaseModel):
    subscriptions: dict[int, Subscription] = Field(default_factory=dict)

    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    def subscribe(self, websocket: WebSocket, machine_uuid: UUID):
        websocket_id = id(websocket)
        self.subscriptions[websocket_id] = Subscription(websocket=websocket, machine=machine_uuid)  
        
    def unsubscribe(self, websocket: WebSocket):
        websocket_id = id(websocket)
        del self.subscriptions[websocket_id]
    
    def get_websockets_for_machine(self, machine_uuid: UUID) -> list[WebSocket]:
        return [
            sub.websocket
            for sub in self.subscriptions.values()
            if sub.machine == machine_uuid
        ]
        
    def remove_subscriptions_by_keys(self, keys: list[int]):
        for key in keys:
            self.subscriptions.pop(key, None)