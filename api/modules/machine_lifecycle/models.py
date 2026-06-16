from uuid import UUID
from pydantic import BaseModel, field_validator, model_validator
from typing import Optional, Literal, Union, TypedDict
from dataclasses import dataclass

################################
#   Machine creation models
################################
DiskType = Literal["raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx"]
StoragePools = Literal["cvms-disk-images", "cvms-iso-images", "cvms-network-filesystems"]

ConnectionPermissions = ["READ", "UPDATE", "DELETE", "ADMINISTER"]


class MachineMetadata(BaseModel):
    tag: str
    value: str


class StoragePool(BaseModel):
    # For now the StoragePool selection is limited to predefined pools on local filesystem
    pool: StoragePools
    # Volume is basically disk name + disk type eg. "disk.qcow2"
    volume: str


class MachineDisk(BaseModel):
    uuid: Optional[UUID] = None
    name: str
    size: int # in Bytes
    type: DiskType
    pool: StoragePools
    

class NetworkInterfaceSource(BaseModel):
    type: Literal["network", "bridge"]
    value: str


class MachineNetworkInterface(BaseModel):
    name: str  
    source: NetworkInterfaceSource
    

class MachineGraphicalFramebuffer(BaseModel):
    type: Literal["rdp", "vnc"]
    port: str | None = None
    autoport: bool
    listen_type: Literal["network", "address"]
    listen_network: str | None = None
    listen_address: str | None = None
    
    @model_validator(mode="after")
    def check_listen_type(self):
        if self.listen_type == "network" and self.listen_network is None:
            raise ValueError("listen_network is required when listen_type is 'network'")
        if self.listen_type == "address" and self.listen_address is None:
            raise ValueError("listen_address is required when listen_type is 'address'")
        return self


class MachineParameters(BaseModel):
    uuid: UUID | None = None                   
    title: str                                                                             
    description: Optional[str] = None
    
    metadata: Optional[list[MachineMetadata]] = None 
          
    ram: int # in MiB                                  
    vcpu: int                                           
    
    system_disk: MachineDisk                        
    additional_disks: Optional[list[MachineDisk]] = None            
    
    iso_image: Optional[StoragePool] = None
                                              
    network_interfaces: Optional[list[MachineNetworkInterface]] = None
    
    # As long as default SSH access is not configured automatically the framebuffer element is obligatory, otherwise machine would be inaccessible.
    framebuffer: MachineGraphicalFramebuffer
    
    assigned_clients: set[UUID]
    
    
################################
#     Machine form models
################################
class CreateMachineFormDisk(BaseModel):
    name: str
    size_bytes: int
    type: DiskType
    
      
class CreateMachineFormConfig(BaseModel):
    ram: int
    vcpu: int
      
      
class CreateMachineFormConnectionProtocols(BaseModel):
    vnc: bool
    rdp: bool
    ssh: bool
    
class CreateMachineForm(BaseModel):
    title: str
    description: str
    tags: set[str]
    
    connection_protocols: CreateMachineFormConnectionProtocols
    assigned_clients: set[UUID]
    
    source_type: Literal["iso", "snapshot"]
    source_uuid: UUID
    
    config: CreateMachineFormConfig
    disks: list[CreateMachineFormDisk]
    os_disk: int = 0
    
    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value
    
    @field_validator("tags", mode="before")
    @classmethod
    def strip_set(cls, value):
        if value is None:
            return value
        return {s.strip() for s in value}
    
class MachineBulkSpec(BaseModel):
    machine_config: CreateMachineForm
    machine_count: int
    
    
class ModifyMachineForm(BaseModel):
    title: str | None = None
    description: str | None = None
    tags: set[str] | None = None
    
    assigned_clients: set[UUID] | None = None
    
    config: CreateMachineFormConfig | None = None
    disks: list[CreateMachineFormDisk] | None = None
    
    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value
    
    @field_validator("tags", mode="before")
    @classmethod
    def strip_set(cls, value):
        if value is None:
            return value
        return {s.strip() for s in value}