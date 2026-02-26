from dataclasses import dataclass
from uuid import UUID

from .all_machines.websocket_manager import AllMachinesWebsocketManager
from .user_machines.websocket_manager import UserMachinesWebsocketManager
from .subscribed_machine.websocket_manager import SubscribedMachineWebsocketsManager


@dataclass(frozen=True)
class _MainMachineWebsocketManager:
    _subscribed_machine_websocket_manager = SubscribedMachineWebsocketsManager()
    _user_machines_websocket_manager = UserMachinesWebsocketManager()
    _all_machines_websocket_manager = AllMachinesWebsocketManager()
    
    @property
    def subscribed_machine_websocket_manager(self):
        return self._subscribed_machine_websocket_manager
    @property
    def user_machines_websocket_manager(self):
        return self._user_machines_websocket_manager
    @property
    def all_machines_websocket_manager(self):
        return self._all_machines_websocket_manager
    
    def start_all_broadcasts(self):
        self._subscribed_machine_websocket_manager.start_broadcasts()
        self._user_machines_websocket_manager.start_broadcasts()
        self._all_machines_websocket_manager.start_broadcasts()
        
    def stop_all_broadcasts(self):
        self._subscribed_machine_websocket_manager.stop_broadcasts()
        self._user_machines_websocket_manager.stop_broadcasts()
        self._all_machines_websocket_manager.stop_broadcasts()
        
    def on_machine_create(self, machine_uuid: UUID):
        self._user_machines_websocket_manager.on_machine_create(machine_uuid)
        self._all_machines_websocket_manager.on_machine_create(machine_uuid)
        
    def on_machine_delete(self, machine_uuid: UUID, machine_linked_account_uuids: list[UUID]):
        self._subscribed_machine_websocket_manager.on_machine_delete(machine_uuid)
        self._user_machines_websocket_manager.on_machine_delete(machine_uuid, machine_linked_account_uuids)
        self._all_machines_websocket_manager.on_machine_delete(machine_uuid)
        
    def on_machine_modify(self, machine_uuid: UUID):
        self._subscribed_machine_websocket_manager.on_machine_modify(machine_uuid)
        self._user_machines_websocket_manager.on_machine_modify(machine_uuid)
        self._all_machines_websocket_manager.on_machine_modify(machine_uuid)


    def on_machine_bootup_start(self, machine_uuid: UUID):
        self._subscribed_machine_websocket_manager.on_machine_bootup_start(machine_uuid)
        self._user_machines_websocket_manager.on_machine_bootup_start(machine_uuid)
        self._all_machines_websocket_manager.on_machine_bootup_start(machine_uuid)


    def on_machine_bootup_success(self, machine_uuid: UUID):
        self._subscribed_machine_websocket_manager.on_machine_bootup_success(machine_uuid)
        self._user_machines_websocket_manager.on_machine_bootup_success(machine_uuid)
        self._all_machines_websocket_manager.on_machine_bootup_success(machine_uuid)


    def on_machine_bootup_fail(self, machine_uuid: UUID, error: str):
        self._subscribed_machine_websocket_manager.on_machine_bootup_fail(machine_uuid, error)
        self._user_machines_websocket_manager.on_machine_bootup_fail(machine_uuid, error)
        self._all_machines_websocket_manager.on_machine_bootup_fail(machine_uuid, error)


    def on_machine_shutdown_start(self, machine_uuid: UUID):
        self._subscribed_machine_websocket_manager.on_machine_shutdown_start(machine_uuid)
        self._user_machines_websocket_manager.on_machine_shutdown_start(machine_uuid)
        self._all_machines_websocket_manager.on_machine_shutdown_start(machine_uuid)


    def on_machine_shutdown_success(self, machine_uuid: UUID):
        self._subscribed_machine_websocket_manager.on_machine_shutdown_success(machine_uuid)
        self._user_machines_websocket_manager.on_machine_shutdown_success(machine_uuid)
        self._all_machines_websocket_manager.on_machine_shutdown_success(machine_uuid)


    def on_machine_shutdown_fail(self, machine_uuid: UUID, error: str):
        self._subscribed_machine_websocket_manager.on_machine_shutdown_fail(machine_uuid, error)
        self._user_machines_websocket_manager.on_machine_shutdown_fail(machine_uuid, error)
        self._all_machines_websocket_manager.on_machine_shutdown_fail(machine_uuid, error)
        
MachineWebSocketManager = _MainMachineWebsocketManager()

__all__ = ["MachineWebSocketManager"]