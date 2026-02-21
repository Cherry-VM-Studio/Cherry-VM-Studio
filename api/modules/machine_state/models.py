from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from typing import Literal, Type
from modules.websockets.models import Command
from modules.users.models import Administrator, Client
from modules.machine_lifecycle.models import DiskType
from datetime import datetime

################################
# Machine data retrieval models
################################
class StaticDiskInfo(BaseModel):
    system: bool
    name: str
    size_bytes: int
    type: DiskType
    
class DynamicDiskInfo(StaticDiskInfo):
    occupied_bytes: int


class MachinePropertiesPayload(BaseModel):
    uuid: UUID                                      
    title: str | None = None
    tags: list[str] | None = None
    description: str | None = None        
    owner: Administrator | None = None          
    assigned_clients: dict[UUID, Client] = {}
    ras_ip: str | None = None   
    ras_port: int | None = None
    connections: dict[Literal["ssh", "rdp", "vnc"], str] | None = None
    disks: list[StaticDiskInfo] | None = None   


class MachineStatePayload(BaseModel):
    uuid: UUID  
    active: bool = False                            
    loading: bool = False                                 
    vcpu: int = 0                                    
    ram_max: int | None = None                      
    ram_used: int | None = None                     
    boot_timestamp: datetime | None = None   


class MachineDisksPayload(BaseModel):
    uuid: UUID
    disks: list[DynamicDiskInfo] | None = None
    

class MachineConnectionsPayload(BaseModel):
    active_connections: list | None = None