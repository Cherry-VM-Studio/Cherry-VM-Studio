import asyncio
from datetime import datetime, timezone
import logging
from starlette.websockets import WebSocket, WebSocketState
from pydantic import BaseModel, ConfigDict
from fastapi.encoders import jsonable_encoder
from modules.users.models import AnyUser
from modules.exceptions.models import CredentialsException
from modules.authentication.validation import decode_token, get_authenticated_user
from modules.exceptions import RaisedException
from .models import AcknowledgeResponse, RejectResponse, CommandData

logger = logging.getLogger(__name__)


class WebSocketHandler(BaseModel):
    websocket: WebSocket
    closer: asyncio.Task | None = None
    user: AnyUser | None = None
    
    model_config = ConfigDict(arbitrary_types_allowed=True)

    async def accept(self, access_token: str) -> None:
        try:             
            self.user = get_authenticated_user(access_token)
            await self.websocket.accept()
            
            self.closer = asyncio.create_task(self.__close_at_token_expiration__(access_token))
            
        except CredentialsException:
            return await self.close(4401, "Could not validate credentials.")
        except Exception:
            await self.close(1011, "Internal server error.")
            logger.exception("Exception occured in the WebsocketHandler's accept method")
        
    async def __close_at_token_expiration__(self, access_token):
        try:
            decoded_payload = decode_token(access_token)
            expiration_delay = max(0, (decoded_payload.expiration_date - datetime.now(timezone.utc)).total_seconds())
            
            if expiration_delay > 0:
                await asyncio.sleep(expiration_delay)
            
            await self.close(4401, "Access token expired.")
        except asyncio.CancelledError:
            pass
        except Exception:
            logger.exception("Exception occured in the WebsocketHandler's __close_at_token_expiration__ method")
        
    async def close(self, code: int = 1000, reason: str | None = None) -> None:
        if self.closer is not None:
            self.closer.cancel()
        try:
            if self.is_connected():
                await self.websocket.close(code, reason)
        except RuntimeError:
            # WebSocket already closed
            pass

    def is_connected(self) -> bool:
        return self.websocket.application_state == WebSocketState.CONNECTED and self.websocket.client_state == WebSocketState.CONNECTED