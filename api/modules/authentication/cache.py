import logging

from cachetools import TTLCache

from modules.authentication.validation import get_authenticated_user

logger = logging.getLogger(__name__)


# 100 users cache that expires after 5 minutes
forwardauth_cache = TTLCache(maxsize=100, ttl=300)

def get_cached_uuid(token: str) -> str:
    # If token is already in the cache, return the user
    if token in forwardauth_cache:
        return forwardauth_cache[token]

    # If not, query the db
    user = get_authenticated_user(token)
    user_uuid = str(user.uuid)
    
    # Save token to the cache
    forwardauth_cache[token] = user_uuid
    return user_uuid