import datetime as dt
from uuid import UUID
from pydantic import BaseModel, field_validator

from modules.validation.string import name_validator
from modules.users.models import Administrator


class IsoRecordInDB(BaseModel):
    uuid: UUID
    name: str
    remote: bool | None
    file_name: str
    file_location: str | None
    file_size_bytes: int
    last_used: dt.datetime | None
    imported_by: UUID | None
    imported_at: dt.datetime | None
    last_modified_by: UUID | None
    last_modified_at: dt.datetime | None
    
    
class IsoRecord(BaseModel):
    uuid: UUID
    name: str
    remote: bool | None
    file_name: str
    file_location: str | None
    file_size_bytes: int
    last_used: dt.datetime | None
    imported_at: dt.datetime | None
    last_modified_at: dt.datetime | None
    imported_by: Administrator | None
    last_modified_by: Administrator | None
    
    
class CreateIsoRecordForm(BaseModel):
    uuid: UUID
    name: str
    
    @field_validator("name", mode="before")
    @classmethod
    def validate_title(cls, value):
        return name_validator(value)
    
    
class CreateIsoRecordArgs(CreateIsoRecordForm):
    uuid: UUID
    file_name: str
    file_size_bytes: int
    imported_by: UUID
    imported_at: dt.datetime
    