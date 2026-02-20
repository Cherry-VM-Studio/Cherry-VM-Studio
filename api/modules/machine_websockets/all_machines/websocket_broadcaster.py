import logging
from fastapi import WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from fastapi.websockets import WebSocketState
from modules.machine_state.data_retrieval import get_all_machine_states
from modules.websockets.models import DataResponse, SubscriptionsDict

logger = logging.getLogger(__name__)

async def broadcast_all_machines_state(subscriptions: SubscriptionsDict):
    if not len(subscriptions):
        return
    
    dead_subscriptions = []
    body = get_all_machine_states()

    for key, subscription in subscriptions.items():
        ws = subscription.websocket
        
        if ws.application_state != WebSocketState.CONNECTED or ws.client_state != WebSocketState.CONNECTED: 
            dead_subscriptions.append(key)
            continue
        
        try:
            await ws.send_json(jsonable_encoder(DataResponse(body=body)))
            
        except (WebSocketDisconnect, RuntimeError):
            logger.exception("Error occured during /ws/machines/global data broadcast.")
            dead_subscriptions.append(key)
            
    for key in dead_subscriptions:
        subscriptions.pop(key, None)
        
            
        