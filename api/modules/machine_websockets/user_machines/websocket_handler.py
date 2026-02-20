import logging
from typing import override

from fastapi import WebSocketDisconnect

from modules.websockets.subscription_manager import SubscriptionManager
from modules.websockets.websocket_handler import WebSocketHandler

logger = logging.getLogger(__name__)

class UserMachinesWebsocketHandler(WebSocketHandler):
    subscription_manager: SubscriptionManager
    
    # its only here to keep the endpoint connection
    async def listen(self):
        try:
            while self.is_connected():
                await self.websocket.receive()
                # ignore cause we dont care
        except WebSocketDisconnect:
            # when websocket disconnects, unsubscribe it for all
            return self.subscription_manager.unsubscribe_from_all(self.websocket)
        except Exception as e:
            logging.exception(f"Unhandled expection within websocket {self.websocket}.")
    
    @override
    async def accept(self, access_token: str):
        await super().accept(access_token)
        
        if self.is_connected() and self.user is not None:
            self.subscription_manager.subscribe(self.websocket, self.user.uuid)
   
    


    
