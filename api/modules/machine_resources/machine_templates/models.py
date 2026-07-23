import datetime as dt
from uuid import UUID
from pydantic import BaseModel, field_validator
from modules.validation.int import int_validator
from modules.validation.string import name_validator
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
    
    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value):
        return name_validator(value)
    
    @field_validator("ram", mode="before")
    @classmethod
    def validate_ram(cls, value):
        return int_validator(
            value=value, 
            min_value=1024, # 1 GiB
            field_name="RAM"
        )
    
    @field_validator("ram", mode="before")
    @classmethod
    def validate_vcpu(cls, value):
        return int_validator(
            value=value, 
            min_value=1,
            field_name="VCPU"
        )
    
class CreateMachineTemplateArgs(CreateMachineTemplateForm):
    owner_uuid: UUID
    