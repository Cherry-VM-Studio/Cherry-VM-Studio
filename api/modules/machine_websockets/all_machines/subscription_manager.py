import logging
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from starlette.websockets import WebSocket

logger = logging.getLogger(__name__)


class SubscriptionManager(BaseModel):
    subscriptions: dict[int, WebSocket] = Field(default_factory=dict)

    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    def subscribe(self, websocket: WebSocket):
        websocket_id = id(websocket)
        self.subscriptions[websocket_id] = websocket
        
    def unsubscribe(self, websocket: WebSocket):
        websocket_id = id(websocket)
        del self.subscriptions[websocket_id]
        
    def remove_subscriptions_by_keys(self, keys: list[int]):
        for key in keys:
            self.subscriptions.pop(key, None)