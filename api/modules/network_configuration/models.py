from uuid import UUID
from pydantic import BaseModel
from ipaddress import IPv4Interface
from pydantic_extra_types.mac_address import MacAddress

class Coordinates(BaseModel):                   
    x: float = 0
    y: float = 0

#-------------------------------#
#  Network Panel Configuration  #
#-------------------------------#
class InternalNetworkSetForm(BaseModel):
    intnet_name: str | None = None
    bridge_name: str | None = None
    bridge_ip: IPv4Interface | None = None
    machines: list[tuple[UUID, MacAddress]] | None = None
    
class InternalNetworkGetForm(BaseModel):
    uuid: UUID
    intnet_name: str
    bridge_name: str
    bridge_mac: MacAddress
    bridge_ip: IPv4Interface | None = None
    machines: list[tuple[UUID, MacAddress]]  
    
class NetworkConfiguration(BaseModel):
    internal_networks: dict[UUID, InternalNetworkSetForm | InternalNetworkGetForm]
    machines_with_internet_access: list[UUID]

type Positions = dict[str, Coordinates]
class NetworkWorkspace(BaseModel):         
    configuration: NetworkConfiguration
    positions: Positions = dict() # key: node id in the workspace
