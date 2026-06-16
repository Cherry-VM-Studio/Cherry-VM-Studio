import datetime as dt
from uuid import UUID
from pydantic import BaseModel
from modules.users.models import Administrator


class MachineTemplateInDB(BaseModel):
    uuid: UUID
    owner_uuid: UUID
    name: str
    ram: int
    vcpu: int
    created_at: dt.datetime | None = None
    
    
class MachineTemplate(BaseModel):
    uuid: UUID
    owner: Administrator | None = None
    name: str
    ram: int
    vcpu: int
    created_at: dt.datetime | None = None
    
    
class CreateMachineTemplateForm(BaseModel):
    name: str
    ram: int
    vcpu: int
    
class CreateMachineTemplateArgs(CreateMachineTemplateForm):
    owner_uuid: UUID
    