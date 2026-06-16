import os
from typing import Optional

def get_env(name: str, default: Optional[str] = None) -> str:
    value = os.getenv(name, default)
    if value is None or value.strip() == "":
        raise ValueError(f"Environmental variable {name} is either not set or empty!")
    return value