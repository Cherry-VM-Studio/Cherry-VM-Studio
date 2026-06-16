import os
from typing import Any, Callable, override
from uuid import UUID

from modules.file_upload.models import UploadNotExistent
from streaming_form_data.targets import BaseTarget


class AppendableTarget(BaseTarget):    
    def __init__(self, uuid: UUID, file_path: str, offset: int = 0, validator: Callable[..., Any] | None = None):
        self.uuid = uuid
        self.file_path = file_path
        self.offset = offset
        self.file = None
        super().__init__(validator)
    
    @override
    def on_start(self):
        if not os.path.exists(self.file_path):
            raise UploadNotExistent(self.uuid)
        
        self.file = open(self.file_path, "r+b")
        self.file.seek(self.offset)    
        
    
    @override
    def on_data_received(self, chunk):
        if self.file is not None:
            self.file.write(chunk)
    
    @override
    def on_finish(self):
        if self.file:
            self.file.flush()
            self.file.close()
            self.file = None