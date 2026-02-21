from json import JSONDecodeError
import logging
from typing import override

from fastapi import WebSocketDisconnect

from modules.machine_state.data_payloads.dynamic_connections_payload import get_all_machine_connections_payloads
from modules.machine_state.data_payloads.dynamic_disks_payload import get_all_machine_disks_payloads
from modules.machine_state.data_payloads.dynamic_state_payload import get_all_machine_state_payloads
from modules.machine_state.data_payloads.static_properties_payload import get_all_machine_properties_payloads
from modules.machine_websockets.all_machines.subscription_manager import SubscriptionManager
from modules.machine_websockets.machine_websocket_messanger import MachineWebSocketMessanger
from modules.users.permissions import has_permissions
from config.permissions_config import PERMISSIONS
from modules.websockets.websocket_handler import WebSocketHandler

logger = logging.getLogger(__name__)

machine_websocket_messanger = MachineWebSocketMessanger()

class AllMachinesWebsocketHandler(WebSocketHandler):
    subscription_manager: SubscriptionManager
    
    # its only here to keep the endpoint connection
    async def listen(self):
        try:
            while self.is_connected():
                await self.websocket.receive()
                # ignore cause we dont care
        except WebSocketDisconnect:
            # when websocket disconnects, unsubscribe it for all
            return self.subscription_manager.unsubscribe(self.websocket)
        except Exception as e:
            logging.exception(f"Unhandled expection within websocket {self.websocket}.")
    
    @override
    async def accept(self, access_token):
        await super().accept(access_token)

        if self.user is None or not has_permissions(self.user, PERMISSIONS.VIEW_ALL_VMS):
            return self.close(4403, "You do not have the necessary permissions to access this resource.")
        
        if not self.is_connected():
            return

        self.subscription_manager.subscribe(self.websocket)

    async def __send_messages_on_connect__(self):
        if self.user is None:
            return
        
        try:
            properties_payload = get_all_machine_properties_payloads()
            await machine_websocket_messanger.send_data_static(self.websocket, properties_payload)
        except Exception as e:
            logging.error("Failed to send STATIC PROPERTIES payload for machines accessed globaly by user %s over websocket: %s", self.user.uuid, e, exc_info=True)

        try:
            state_payload = get_all_machine_state_payloads()
            await machine_websocket_messanger.send_data_dynamic(self.websocket, state_payload)
        except Exception as e:
            logging.error("Failed to send DYNAMIC STATE payload for machines accessed globaly by user %s over websocket: %s", self.user.uuid, e, exc_info=True)

        try:
            disks_payload = get_all_machine_disks_payloads()
            await machine_websocket_messanger.send_data_dynamic_disks(self.websocket, disks_payload)
        except Exception as e:
            logging.error("Failed to send DYNAMIC DISKS payload for machines accessed globaly by user %s over websocket: %s", self.user.uuid, e,exc_info=True)
            
        try:
            connections_payload = get_all_machine_connections_payloads()
            await machine_websocket_messanger.send_data_dynamic_connections(self.websocket, connections_payload)
        except Exception as e:
            logging.error("Failed to send DYNAMIC CONNECTIONS payload for machines accessed globaly by user %s over websocket: %s", self.user.uuid, e,exc_info=True)


    
