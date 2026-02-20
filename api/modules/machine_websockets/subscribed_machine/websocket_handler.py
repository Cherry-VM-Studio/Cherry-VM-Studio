import logging
from typing import override
from uuid import UUID
from starlette.websockets import WebSocketDisconnect

from modules.machine_state.data_payloads.dynamic_disks_payload import get_machine_disks_payload
from modules.machine_state.data_payloads.dynamic_state_payload import get_machine_state_payload
from modules.machine_state.data_payloads.static_properties_payload import get_machine_properties_payload
from modules.machine_websockets.machine_websocket_messanger import MachineWebSocketMessanger
from modules.websockets.websocket_handler import WebSocketHandler
from modules.machine_websockets.subscribed_machine.subscription_manager import SubscriptionManager


logger = logging.getLogger(__name__)

machine_websocket_messanger = MachineWebSocketMessanger()

class SubscribedMachinesWebsocketHandler(WebSocketHandler):
    subscription_manager: SubscriptionManager
    
    async def listen(self):
        try:
            while self.is_connected():
                await self.websocket.receive()
                # ignore cause we dont care
        except WebSocketDisconnect:
            # when websocket disconnects, unsubscribe it for all
            return self.subscription_manager.unsubscribe(self.websocket)
        except Exception:
            logging.exception(f"Unhandled expection within websocket {self.websocket}.")

    @override
    async def accept(self, access_token: str, machine_uuid: UUID):
        await super().accept(access_token)
        
        if self.is_connected() and self.user is not None:
            self.subscription_manager.subscribe(self.websocket, machine_uuid)
            await self.__send_messages_on_connect__(machine_uuid)
            
    async def __send_messages_on_connect__(self, machine_uuid: UUID):
        try:
            properties_payload = get_machine_properties_payload(machine_uuid)
            await machine_websocket_messanger.send_data_static(self.websocket, {machine_uuid: properties_payload})
        except Exception as e:
            logging.error("Failed to send STATIC PROPERTIES payload for machine %s over websocket: %s", machine_uuid, e, exc_info=True)

        try:
            state_payload = get_machine_state_payload(machine_uuid)
            await machine_websocket_messanger.send_data_dynamic(self.websocket, {machine_uuid: state_payload})
        except Exception as e:
            logging.error("Failed to send DYNAMIC STATE payload for machine %s over websocket: %s", machine_uuid, e, exc_info=True)

        try:
            disks_payload = get_machine_disks_payload(machine_uuid)
            await machine_websocket_messanger.send_data_dynamic_disks(self.websocket, {machine_uuid: disks_payload})
        except Exception as e:
            logging.error("Failed to send DYNAMIC DISKS payload for machine %s over websocket: %s", machine_uuid, e,exc_info=True)
