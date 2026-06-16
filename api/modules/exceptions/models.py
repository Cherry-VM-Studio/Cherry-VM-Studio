from fastapi import HTTPException, status

class RaisedException(Exception):
    pass

class HTTPUnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class HTTPNotFoundException(HTTPException):
    def __init__(self, detail: str = "Element not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class CredentialsException(HTTPUnauthorizedException):
    def __init__(self):
        super().__init__(detail="Could not validate credentials.")
