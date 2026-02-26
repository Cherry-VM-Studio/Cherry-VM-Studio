from uuid import UUID

from modules.machine_websockets.all_machines.websocket_handler import AllMachinesWebsocketHandler
from modules.machine_websockets.user_machines.websocket_handler import UserMachinesWebsocketHandler
from modules.machine_websockets.subscribed_machine.websocket_handler import SubscribedMachinesWebsocketHandler
from modules.machine_websockets.main_manager import MachineWebSocketManager
from fastapi import APIRouter, WebSocket

router = APIRouter(
    prefix='/ws/machines'
)

MachineWebSocketManager.start_all_broadcasts()


@router.websocket('/subscribed')
async def __subscribed_machines_state_websocket__(websocket: WebSocket, machine_uuid: UUID, access_token: str):
    websocket_handler = SubscribedMachinesWebsocketHandler(
        websocket=websocket, 
        subscription_manager=MachineWebSocketManager.subscribed_machine_websocket_manager.subscription_manager
    )
    
    await websocket_handler.accept(access_token, machine_uuid)
    await websocket_handler.listen()
    
    
@router.websocket('/account')
async def __user_machines_state_websocket__(websocket: WebSocket, access_token: str):  
    websocket_handler = UserMachinesWebsocketHandler(
        websocket=websocket, 
        subscription_manager=MachineWebSocketManager.user_machines_websocket_manager.subscription_manager
    )
    
    await websocket_handler.accept(access_token)
    await websocket_handler.listen()

    
@router.websocket('/global')
async def __all_machines_state_websocket__(websocket: WebSocket, access_token: str):  
    websocket_handler = AllMachinesWebsocketHandler(
        websocket=websocket, 
        subscription_manager=MachineWebSocketManager.all_machines_websocket_manager.subscription_manager
    )
    
    await websocket_handler.accept(access_token)
    await websocket_handler.listen()

    
    



