

from typing import Literal
from starlette.websockets import WebSocket
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID, uuid4



class Command(BaseModel, extra='allow'):
    method: str
    access_token: str = ""
    uuid: UUID = Field(default_factory=uuid4)
    


class CommandData(BaseModel):
    method: str | None = None
    uuid: UUID = Field(default_factory=uuid4) 



ResponseMethods = Literal["ACKNOWLEDGE", "REJECT", "DATA"]



class Response(BaseModel):
    method: ResponseMethods
    uuid: UUID = Field(default_factory=uuid4)



class AcknowledgeResponse(Response):
    method: Literal["ACKNOWLEDGE"] = "ACKNOWLEDGE"
    command: CommandData



class RejectResponse(Response):
    method: Literal["REJECT"] = "REJECT"
    reason: str
    command: CommandData



class DataResponse(Response):
    method: Literal["DATA"] = "DATA"
    body: dict | None = None



class Subscription(BaseModel):
    websocket: WebSocket
    resources: set[UUID]
    
    model_config = ConfigDict(arbitrary_types_allowed=True)




SubscriptionsDict = dict[int, Subscription]