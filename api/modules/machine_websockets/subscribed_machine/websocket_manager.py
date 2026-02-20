
import asyncio
import logging
from typing import Awaitable, Callable, Mapping, TypeVar
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState
from pydantic import BaseModel

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
    broadcasting_state: bool = False
    broadcasting_disks: bool = False
    
    async def __broadcast_machine_payload__(
        self,
        payload_retriever: Callable[[UUID], T],
        payload_sender: Callable[[WebSocket, dict[UUID, T]], Awaitable[None]],
    ):
        dead_subscriptions = []

        for key, subscription in self.subscription_manager.subscriptions.items():
            ws: WebSocket = subscription.websocket
            machine_uuid = subscription.machine

            if ws.application_state != WebSocketState.CONNECTED or ws.client_state != WebSocketState.CONNECTED:
                dead_subscriptions.append(key)
                continue

            try:
                payload = payload_retriever(machine_uuid)
                await payload_sender(ws, {machine_uuid: payload})
            except (WebSocketDisconnect, RuntimeError) as e:
                dead_subscriptions.append(key)
            except Exception as e:
                logger.error("Unexpected error while broadcasting payload for machine %s: %s", machine_uuid, e, exc_info=True)

        if dead_subscriptions:
            self.subscription_manager.remove_subscriptions_by_keys(dead_subscriptions)
                
    async def __broadcast_machine_states__(self):
        await self.__broadcast_machine_payload__(
            payload_retriever=get_machine_state_payload, 
            payload_sender=machine_websocket_messanger.send_data_dynamic
        )
        
    async def __broadcast_machine_disks__(self):
        await self.__broadcast_machine_payload__(
            payload_retriever=get_machine_disks_payload, 
            payload_sender=machine_websocket_messanger.send_data_dynamic_disks
        )
    
    
    async def run_continuous_broadcast_of_machine_states(self, intervalInSeconds):
        """ start running the broadcast data function for the subscriptions every interval """
        if self.broadcasting_state: return # if already broadcasting no need to double it
        self.broadcasting_state = True
        
        while self.broadcasting_state and self.broadcasting_state is not None:
            try: 
                await self.__broadcast_machine_states__()
            except Exception:
                logger.exception("Exception occured during machine state data broadcast in the SubscribedMachineWebsocketsManager.")
            await asyncio.sleep(intervalInSeconds)
            
            
    async def run_continuous_broadcast_of_machine_disks(self, intervalInSeconds):
        """ start running the broadcast data function for the subscriptions every interval """
        if self.broadcasting_disks: return # if already broadcasting no need to double it
        self.broadcasting_disks = True
        
        while self.broadcasting_disks and self.broadcasting_disks is not None:
            try: 
                await self.__broadcast_machine_states__()
            except Exception:
                logger.exception("Exception occured during machine disks data broadcast in the SubscribedMachineWebsocketsManager.")
            await asyncio.sleep(intervalInSeconds)
            
            
    def stop_continous_broadcast(self):
        self.broadcasting_state = False
        self.broadcasting_disks = False
        
    
    def on_machine_delete(self, machine_uuid: UUID):
        websockets = self.subscription_manager.get_websockets_for_machine(machine_uuid)
        
        for websocket in websockets:
            asyncio.create_task(machine_websocket_messanger.send_delete(websocket, machine_uuid))
       
            
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


    