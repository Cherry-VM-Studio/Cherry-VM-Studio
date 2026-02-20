import logging
from fastapi import WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from fastapi.websockets import WebSocketState
from modules.machine_state.data_retrieval import get_machine_states_by_user
from modules.users.users import UsersManager
from modules.websockets.models import DataResponse, SubscriptionsDict

logger = logging.getLogger(__name__)

async def broadcast_user_machines_state(subscriptions: SubscriptionsDict):
    dead_subscriptions = []
    
    for key, subscription in subscriptions.items():
        ws = subscription.websocket
        
        if ws.application_state != WebSocketState.CONNECTED or ws.client_state != WebSocketState.CONNECTED: 
            dead_subscriptions.append(key)
            continue

        try:
            user_uuid = next(iter(subscription.resources))
            user = UsersManager.get_user(user_uuid)
            
            if user is None:
                raise RuntimeError
            
            body = get_machine_states_by_user(user)
            await ws.send_json(jsonable_encoder(DataResponse(body=body)))
            
        except (WebSocketDisconnect, RuntimeError):
            logger.exception("Error occured during /ws/machines/account data broadcast.")
            dead_subscriptions.append(key)
            
    for key in dead_subscriptions:
        subscriptions.pop(key, None)
        
        