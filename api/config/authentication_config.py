from dataclasses import dataclass
from datetime import timedelta

@dataclass(frozen=True)
class AuthenticationConfig:
    algorithm: str = "HS256"
    access_token_lifetime: timedelta = timedelta(minutes=60)
    refresh_token_lifetime: timedelta = timedelta(minutes=1440)
    
AUTHENTICATION_CONFIG = AuthenticationConfig()