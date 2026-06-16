from pydantic import BaseModel

from modules.file_upload.models import UploadTooLargeException


class UploadSizeValidator(BaseModel):
    body_len: int = 0
    max_size_bytes: int
    
    def __call__(self, chunk: bytes):
        self.body_len += len(chunk)
        if self.body_len > self.max_size_bytes:
            raise UploadTooLargeException(body_len=self.body_len)


