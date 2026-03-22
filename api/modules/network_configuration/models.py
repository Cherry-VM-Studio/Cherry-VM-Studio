from uuid import UUID, uuid4
from pydantic import BaseModel, Field

class Coordinates(BaseModel):                   
    x: float = 0
    y: float = 0

#-------------------------------#
#  Network Panel Configuration  #
#-------------------------------#

class Intnet(BaseModel):                        # * Contains all necessary intnet information for the web panel
    uuid: UUID                                  # unique intnet identifier 
    machines: list[UUID] = []                   # machines added to the intnet
    number: int | None = None                   # number indentifing the intnet from the user's perspective

IntnetConfiguration = dict[UUID, Intnet]        # * Form of the intnet data required by the frontend
    
Positions = dict[UUID, Coordinates]

class NetworkConfiguration(BaseModel):         
    intnets: IntnetConfiguration | None = None   
    positions: Positions | None = None
