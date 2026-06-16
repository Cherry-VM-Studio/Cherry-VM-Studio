from uuid import UUID
from pydantic import BaseModel

class UploadTooLargeException(Exception):
    def __init__(self, body_len: int):
        self.body_len = body_len
        super().__init__(f"Upload too large: {body_len} bytes")


class UploadHeadersError(Exception):
    pass


class UploadNotExistent(Exception):
    def __init__(self, uuid: UUID, **args):
        self.uuid = uuid
        super().__init__(**args)
        
class UploadAlreadyExists(Exception):
    def __init__(self, uuid: UUID, **args):
        self.uuid = uuid
        super().__init__(**args)
        

class UploadedFile(BaseModel):
    name: str
    location: str
    size: int
    form_data: str
    
    