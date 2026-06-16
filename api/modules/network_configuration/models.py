from uuid import UUID, uuid4
from pydantic import BaseModel, Field

class Coordinates(BaseModel):                   
    x: float = 0
    y: float = 0

#-------------------------------#
#  Network Panel Configuration  #
#-------------------------------#

class InternalNetwork(BaseModel):               # * Contains all necessary intnet information for the web panel
    uuid: UUID                                  # unique intnet identifier 
    machines: list[UUID] = []                   # machines added to the intnet
    number: int | None = None                   # number indentifing the intnet from the user's perspective
    display_name: str = ""

class NetworkConfiguration(BaseModel):
    internal_networks: dict[UUID, InternalNetwork]
    machines_with_internet_access: list[UUID]
    
type Positions = dict[str, Coordinates]
class NetworkWorkspace(BaseModel):         
    configuration: NetworkConfiguration
    positions: Positions = dict() # key: node id in the workspace
