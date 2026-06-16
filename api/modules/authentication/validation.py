import logging
import jwt
import re
import base64

from typing import Annotated, Literal
from uuid import UUID
from fastapi import Depends, HTTPException
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

from modules.users.users import UsersManager

from .models import DecodedTokenPayload, Token, TokenTypes
from .tokens import is_token_of_type
from .passwords import verify_password
from application.env import SECRET_KEY
from config.authentication_config import AUTHENTICATION_CONFIG
from modules.exceptions import CredentialsException
from modules.users.permissions import is_admin
from modules.users.models import AdministratorExtended, AnyUser,  AnyUserExtended
from modules.postgresql import select_one

logger = logging.getLogger(__name__)

def decode_token(token: Token) -> DecodedTokenPayload:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[AUTHENTICATION_CONFIG.algorithm])
    
    return DecodedTokenPayload(
        subject=payload.get("sub"),
        expiration_date=payload.get("exp"),
        token_type=payload.get("token_type"),
    )
        


def validate_user_token(token: Token, token_type: TokenTypes) -> AnyUserExtended:
    try:
        payload = decode_token(token)

        if not is_token_of_type(payload, token_type):
            raise InvalidTokenError()

        uuid = UUID(payload.subject)
        user = UsersManager.get_user(uuid)
        
        if user is None or user.disabled:
            raise CredentialsException()

        UsersManager.update_user_last_active(user)
        return UsersManager.extend_user_model(user)

    except (InvalidTokenError, ExpiredSignatureError, ValueError):
        raise CredentialsException()



def authenticate_user(username: str, password: str) -> AnyUserExtended | Literal[False]:
    user = UsersManager.get_user_by_username(username)
    
    if not user or user.disabled:
        return False
    
    password_in_db = UsersManager.get_user_password(user.uuid)
    
    if not verify_password(password, password_in_db):
        return False
    
    return UsersManager.extend_user_model(user)



def get_authenticated_user(token: Token) -> AnyUserExtended: 
    return validate_user_token(token, 'access')



def get_authenticated_administrator(token: Token) -> AdministratorExtended:
    user = validate_user_token(token, 'access')
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="You do not have the necessary permissions to access this resource.")    
    return user



def get_user_from_refresh_token(token: Token) -> AnyUserExtended:
    return validate_user_token(token, 'refresh')


DependsOnAdministrativeAuthentication = Annotated[AdministratorExtended, Depends(get_authenticated_administrator)]


DependsOnAuthentication = Annotated[AnyUserExtended, Depends(get_authenticated_user)]


DependsOnRefreshToken = Annotated[AnyUserExtended, Depends(get_user_from_refresh_token)]

def encode_guacamole_connection_string(machine_uuid: UUID, connection_type: str):
    """
    Generate encoded Apache Guacamole connection string used for machine remote desktop access.
    """
    
    machine_uuid_str = str(machine_uuid)
    
    identity_source = "postgresql"
    
    regex_pattern = f"^{re.escape(machine_uuid_str)}_{re.escape(connection_type)}$"
    
    select_connection_id = """
        SELECT connection_id 
        FROM guacamole_connection
        WHERE connection_name ~ %s;
    """
    
    connection_id = select_one(select_connection_id, (regex_pattern, ))
    
    if connection_id is None:
        raise Exception(f"Could not encode guacamole connection string for non-existant {connection_type} connection to machine {machine_uuid_str}.")
    
    connection_id = connection_id.get("connection_id")
    
    raw_connection_string = f"{connection_id}\0c\0{identity_source}".encode("utf-8")
    
    return base64.urlsafe_b64encode(raw_connection_string).rstrip(b"=").decode("ascii")