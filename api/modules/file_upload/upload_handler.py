import asyncio
import logging
import os
import datetime as dt
from pathlib import Path
from uuid import UUID
from fastapi import Request
from pydantic import BaseModel
from streaming_form_data import StreamingFormDataParser

from config.files_config import FILES_CONFIG
from modules.file_upload.targets import AppendableTarget
from modules.file_upload.validators import UploadSizeValidator
from modules.file_upload.models import UploadAlreadyExists, UploadHeadersError, UploadNotExistent

logger = logging.getLogger(__name__)

waiting_requests: dict[UUID, asyncio.Future] = {}


class UploadHandler(BaseModel):
    max_size_bytes: int
    extension: str
    save_directory_path: Path
    
    async def _delayed_delation(self, uuid: UUID):
        await asyncio.sleep(FILES_CONFIG.upload_timeout_seconds)
        
        file_location = self.get_temporary_location(uuid)
        
        if os.path.exists(file_location):
            os.remove(file_location)
        else:
            logger.warning(f"Scheduled deletion of file {file_location} failed - File could not be found.")
            
        waiting_requests.pop(uuid)    
        
    def _schedule_deletion(self, uuid: UUID):
        waiting_requests[uuid] = asyncio.create_task(self._delayed_delation(uuid))
        
    def _cancel_deletion(self, uuid: UUID):
        task = waiting_requests.get(uuid)
        task.cancel() if task else None
        
    def get_temporary_location(self, uuid: UUID):
        return os.path.join(self.save_directory_path, f"{uuid}.{self.extension}.temp")
    
    def get_final_location(self, uuid: UUID):
        return os.path.join(self.save_directory_path, f"{uuid}.{self.extension}")
    
    def start_upload(self, uuid: UUID):
        file_location = self.get_temporary_location(uuid)
        
        if os.path.exists(file_location):
            raise UploadAlreadyExists(uuid)
        
        self._schedule_deletion(uuid)
        
        with open(file_location, "w"): # create file
            pass
    
    async def append_chunk(self, request: Request, uuid: UUID, offset: int):
        size_validator = UploadSizeValidator(max_size_bytes=self.max_size_bytes)
        file_location = self.get_temporary_location(uuid)
        
        self._cancel_deletion(uuid)
        
        try:
            file_target = AppendableTarget(
                uuid=uuid,
                file_path=file_location, 
                offset=offset, 
                validator=UploadSizeValidator(max_size_bytes=self.max_size_bytes)
            )
            
            content_type = request.headers.get("content-type")
            
            if not content_type or not content_type.startswith("multipart/form-data"):
                raise UploadHeadersError('Content-Type must be set to "multipart/form-data"')
            
            parser = StreamingFormDataParser(headers=request.headers)
            parser.register('file', file_target)
            
            async for chunk in request.stream():
                size_validator(chunk)
                parser.data_received(chunk)
                
                
        except Exception as e:
            location = os.path.join(self.save_directory_path, f"{uuid}.iso.temp")
            if os.path.exists(location):
                os.remove(location)
                logger.error(f"{dt.datetime.now()} : Removing {uuid}.{self.extension}.temp due to errors that occured during import.")
            raise e
        
        self._schedule_deletion(uuid)
            
    def finish_upload(self, uuid: UUID):
        old_location = self.get_temporary_location(uuid)
        new_location = self.get_final_location(uuid)
        
        if not os.path.exists(old_location):
            raise UploadNotExistent(uuid)
        
        self._cancel_deletion(uuid)
        
        os.rename(old_location, new_location)