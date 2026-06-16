import logging
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from starlette.websockets import WebSocket

logger = logging.getLogger(__name__)

class Subscription(BaseModel):
    websocket: WebSocket
    user: UUID
    
    model_config = ConfigDict(arbitrary_types_allowed=True)


class SubscriptionManager(BaseModel):
    subscriptions: dict[int, Subscription] = Field(default_factory=dict)

    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    def subscribe(self, websocket: WebSocket, user_uuid: UUID):
        websocket_id = id(websocket)
        self.subscriptions[websocket_id] = Subscription(websocket=websocket, user=user_uuid)  
        
    def unsubscribe(self, websocket: WebSocket):
        websocket_id = id(websocket)
        del self.subscriptions[websocket_id]
    
    def get_websockets_for_user(self, user_uuid: UUID) -> list[WebSocket]:
        return [
            sub.websocket
            for sub in self.subscriptions.values()
            if sub.user == user_uuid
        ]
        
    def get_websockets_for_users(self, user_uuids: set[UUID] | list[UUID]) -> list[WebSocket]:
        user_uuid_set = set(user_uuids)

        return [
            sub.websocket
            for sub in self.subscriptions.values()
            if sub.user in user_uuid_set
        ]
        
    def remove_subscriptions_by_keys(self, keys: list[int]):
        for key in keys:
            self.subscriptions.pop(key, None)