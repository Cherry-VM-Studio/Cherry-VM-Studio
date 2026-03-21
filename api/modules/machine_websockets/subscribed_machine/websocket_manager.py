import asyncio
import logging
from typing import Awaitable, Callable, Literal, TypeVar
from uuid import UUID

from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState
from pydantic import BaseModel

from config.websockets_config import WEBSOCKETS_CONFIG
from modules.machine_state.data_payloads.dynamic_connections_payload import get_machine_connections_payload
from modules.machine_state.data_payloads.dynamic_disks_payload import get_machine_disks_payload
from modules.machine_state.data_payloads.dynamic_state_payload import get_machine_state_payload
from modules.machine_state.data_payloads.static_properties_payload import get_machine_properties_payload
from modules.machine_websockets.machine_websocket_messanger import MachineWebSocketMessanger
from modules.machine_websockets.subscribed_machine.subscription_manager import SubscriptionManager


T = TypeVar("T", bound=BaseModel)

logger = logging.getLogger(__name__)

machine_websocket_messanger = MachineWebSocketMessanger()

class SubscribedMachineWebsocketsManager:
    subscription_manager = SubscriptionManager()
    _broadcast_flags: dict[Literal["states", "disks", "connections"], bool] = {}
    _broadcast_tasks: dict[Literal["states", "disks", "connections"], asyncio.Task] = {}
    
    
    """ Prepares and sends approperiate payload for each websocket."""
    """ payload_retriever - callback for a function retrieving the payload from the machine uuid."""
    """ payload_sender - callback for a function sending the payload through the provided websocket."""
    async def __broadcast_machine_payload__(
        self,
        payload_retriever: Callable[[UUID], T],
        payload_sender: Callable[[WebSocket, dict[UUID, T]], Awaitable[None]],
    ):
        dead_subscriptions = []

        for key, subscription in list(self.subscription_manager.subscriptions.items()):
            ws: WebSocket = subscription.websocket
            machine_uuid = subscription.machine

            if ws.application_state != WebSocketState.CONNECTED or ws.client_state != WebSocketState.CONNECTED:
                dead_subscriptions.append(key)
                continue

            try:
                payload = payload_retriever(machine_uuid)
                await payload_sender(ws, {machine_uuid: payload})
            except (WebSocketDisconnect, HTTPException, RuntimeError) as e:
                dead_subscriptions.append(key)
            except Exception as e:
                logger.error("Unexpected error while broadcasting payload for machine %s: %s", machine_uuid, e, exc_info=True)

        if dead_subscriptions:
            self.subscription_manager.remove_subscriptions_by_keys(dead_subscriptions)
           
    """ Sends machine states data for each websocket based on the subscriptions. """            
    async def __broadcast_machine_states__(self):
        await self.__broadcast_machine_payload__(
            payload_retriever=get_machine_state_payload, 
            payload_sender=machine_websocket_messanger.send_data_dynamic
        )
        
    """ Sends machine disks data for each websocket based on the subscriptions. """                
    async def __broadcast_machine_disks__(self):
        await self.__broadcast_machine_payload__(
            payload_retriever=get_machine_disks_payload, 
            payload_sender=machine_websocket_messanger.send_data_dynamic_disks
        )
        
    """ Sends machine connections data for each websocket based on the subscriptions. """     
    async def __broadcast_machine_connections__(self):
        await self.__broadcast_machine_payload__(
            payload_retriever=get_machine_connections_payload, 
            payload_sender=machine_websocket_messanger.send_data_dynamic_connections
        )
        
    """ Starts a continous broadcast for provided payload type (name). """     
    async def _run_continuous_broadcast(self, name: Literal["states", "disks", "connections"], callback: Callable[[], Awaitable[None]], intervalInSeconds: int):
        if self._broadcast_flags.get(name):
            return  # already running
        
        self._broadcast_flags[name] = True
        
        while self._broadcast_flags.get(name):
            try: 
                await callback()
            except Exception:
                logger.exception(f"Exception occured during '{name}' broadcast in the SubscribedMachineWebsocketsManager.")
            await asyncio.sleep(intervalInSeconds)
    
    """ Starts all the broadcasts using intervals from the config. """
    def start_broadcasts(self):
        self._broadcast_tasks["states"] = asyncio.create_task(
            self._run_continuous_broadcast("states", self.__broadcast_machine_states__, WEBSOCKETS_CONFIG.state_broadcast_interval)
        )
        self._broadcast_tasks["disks"] = asyncio.create_task(
            self._run_continuous_broadcast("disks", self.__broadcast_machine_disks__, WEBSOCKETS_CONFIG.disks_broadcast_interval)
        )
        self._broadcast_tasks["connections"] = asyncio.create_task(
            self._run_continuous_broadcast("connections", self.__broadcast_machine_connections__, WEBSOCKETS_CONFIG.connections_broadcast_interval)
        )
        
    """ Stops all the broadcasts """
    def stop_broadcasts(self):
        self._broadcast_flags["states"] = False
        self._broadcast_flags["disks"] = False
        self._broadcast_flags["connections"] = False
        
    """ Sends approperiate message for all websockets subscribed to deleted machine. """
    def on_machine_delete(self, machine_uuid: UUID):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)
        
        for websocket in websockets:
            asyncio.create_task(machine_websocket_messanger.send_delete(websocket, machine_uuid))
       
    """ Sends updated machine properties (static data) for all websockets subscribed to modified machine. """
    def on_machine_modify(self, machine_uuid: UUID):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)
        machine_properties_payload = get_machine_properties_payload(machine_uuid)
        
        for websocket in websockets:
            asyncio.create_task(machine_websocket_messanger.send_data_static(websocket, {machine_uuid: machine_properties_payload}))
        
        
    def on_machine_bootup_start(self, machine_uuid: UUID):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)
        
        for websocket in websockets:
            asyncio.create_task(machine_websocket_messanger.send_bootup_start(websocket, machine_uuid))
    
    
    def on_machine_bootup_success(self, machine_uuid: UUID):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)

        for websocket in websockets:
            asyncio.create_task(
                machine_websocket_messanger.send_bootup_success(websocket, machine_uuid)
            )


    def on_machine_bootup_fail(self, machine_uuid: UUID, error: str):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)

        for websocket in websockets:
            asyncio.create_task(
                machine_websocket_messanger.send_bootup_fail(websocket, machine_uuid, error)
            )


    def on_machine_shutdown_start(self, machine_uuid: UUID):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)

        for websocket in websockets:
            asyncio.create_task(
                machine_websocket_messanger.send_shutdown_start(websocket, machine_uuid)
            )


    def on_machine_shutdown_success(self, machine_uuid: UUID):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)

        for websocket in websockets:
            asyncio.create_task(
                machine_websocket_messanger.send_shutdown_success(websocket, machine_uuid)
            )


    def on_machine_shutdown_fail(self, machine_uuid: UUID, error: str):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)

        for websocket in websockets:
            asyncio.create_task(
                machine_websocket_messanger.send_shutdown_fail(websocket, machine_uuid, error)
            )


    