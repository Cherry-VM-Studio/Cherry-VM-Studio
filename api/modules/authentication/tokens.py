import jwt
from datetime import datetime, timedelta, timezone
from modules.users.models import AnyUser, AnyUserExtended
from application.env import SECRET_KEY
from config.authentication_config import AUTHENTICATION_CONFIG
from .models import DecodedTokenPayload, Token, TokenTypes, Tokens



def create_token(token_type: TokenTypes, user: AnyUser | AnyUserExtended, expires_delta: timedelta) -> Token:
    to_encode = {
        "token_type": token_type,
        "sub": str(user.uuid),
        "exp": datetime.now(timezone.utc) + expires_delta
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=AUTHENTICATION_CONFIG.algorithm)


def create_access_token(user: AnyUser | AnyUserExtended) -> Token:
    return create_token("access", user, AUTHENTICATION_CONFIG.access_token_lifetime)


def create_refresh_token(user: AnyUser | AnyUserExtended) -> Token:
    return create_token("refresh", user, AUTHENTICATION_CONFIG.refresh_token_lifetime)


def get_user_tokens(user: AnyUser | AnyUserExtended):
    return Tokens(
        access_token = create_access_token(user),
        refresh_token = create_refresh_token(user)
    )
    

def is_token_of_type(payload: DecodedTokenPayload, token_type: TokenTypes):
    return payload.token_type == token_type


def is_access_token(payload: DecodedTokenPayload):
    return is_token_of_type(payload, 'access')


def is_refresh_token(payload: DecodedTokenPayload):
    return is_token_of_type(payload, 'refresh')


