from uuid import UUID
from pydantic import BaseModel, field_validator
from ipaddress import IPv4Interface
from pydantic_extra_types.mac_address import MacAddress

from modules.validation.string import name_validator


################################
#     Coordinate System
################################
class Coordinates(BaseModel):                   
    x: float = 0
    y: float = 0

type Positions = dict[str, Coordinates]


################################
# Internal Networks Configuration
################################
class InternalNetworkSetForm(BaseModel):
    uuid: UUID
    intnet_name: str | None = None
    bridge_ip: IPv4Interface | None = None
    machines: list[UUID] | None = None
    
    @field_validator("intnet_name", mode="before")
    @classmethod
    def validate_username(cls, value):
        return name_validator(value, field_name="intnet_name")
    
class InternalNetworkGetForm(BaseModel):
    uuid: UUID
    intnet_name: str | None = None
    bridge_mac: MacAddress
    bridge_ip: IPv4Interface | None = None
    machines: dict[UUID, MacAddress]

class NetworkConfigurationSet(BaseModel):
    internal_networks: dict[UUID, InternalNetworkSetForm]
    machines_with_internet_access: list[UUID]
    
class NetworkConfigurationGet(BaseModel):
    internal_networks: dict[UUID, InternalNetworkGetForm]
    machines_with_internet_access: dict[UUID, MacAddress]

class NetworkWorkspace(BaseModel):         
    configuration: NetworkConfigurationSet | NetworkConfigurationGet
    positions: Positions = dict() # key: node id in the workspace
