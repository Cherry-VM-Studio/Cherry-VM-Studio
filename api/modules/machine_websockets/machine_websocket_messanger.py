from uuid import UUID

from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from modules.machine_state.models import MachineConnectionsPayload, MachineDisksPayload, MachinePropertiesPayload, MachineStatePayload
from .models import WebSocketMessage, WebSocketMessageBaseBody


class MachineWebSocketMessanger:
    
    async def send_create(self, ws: WebSocket, machine_properties_payload: MachinePropertiesPayload):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="CREATE",
            body=machine_properties_payload
        )))
        
    async def send_delete(self, ws: WebSocket, machine_uuid: UUID):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="DELETE", 
            body=WebSocketMessageBaseBody(uuid=machine_uuid)
        )))
        
    async def send_data_static(self, ws: WebSocket, machine_properties_payloads: dict[UUID, MachinePropertiesPayload]):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="DATA_STATIC",
            body=machine_properties_payloads
        )))
        
    async def send_data_dynamic(self, ws: WebSocket, machine_state_payloads: dict[UUID, MachineStatePayload]):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="DATA_DYNAMIC",
            body=machine_state_payloads
        )))
        
    async def send_data_dynamic_disks(self, ws: WebSocket, machine_disk_payloads: dict[UUID, MachineDisksPayload]):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="DATA_DYNAMIC_DISKS",
            body=machine_disk_payloads
        )))
        
    async def send_data_dynamic_connections(self, ws: WebSocket, machine_connections_payloads: dict[UUID, MachineConnectionsPayload]):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="DATA_DYNAMIC_CONNECTIONS",
            body=machine_connections_payloads
        )))
        
    async def send_bootup_start(self, ws: WebSocket, machine_uuid: UUID):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="BOOTUP_START",
            body=WebSocketMessageBaseBody(uuid=machine_uuid)
        )))

    async def send_bootup_success(self, ws: WebSocket, machine_uuid: UUID):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="BOOTUP_SUCCESS",
            body=WebSocketMessageBaseBody(uuid=machine_uuid)
        )))

    async def send_bootup_fail(self, ws: WebSocket, machine_uuid: UUID, error: str):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="BOOTUP_FAIL",
            body=WebSocketMessageBaseBody(uuid=machine_uuid, error=error)
        )))

    async def send_shutdown_start(self, ws: WebSocket, machine_uuid: UUID):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="SHUTDOWN_START",
            body=WebSocketMessageBaseBody(uuid=machine_uuid)
        )))

    async def send_shutdown_success(self, ws: WebSocket, machine_uuid: UUID):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="SHUTDOWN_SUCCESS",
            body=WebSocketMessageBaseBody(uuid=machine_uuid)
        )))

    async def send_shutdown_fail(self, ws: WebSocket, machine_uuid: UUID, error: str):
        await ws.send_json(jsonable_encoder(WebSocketMessage(
            type="SHUTDOWN_FAIL",
            body=WebSocketMessageBaseBody(uuid=machine_uuid, error=error)
        )))

