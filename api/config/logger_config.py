from dataclasses import dataclass
from os import getenv
import logging

@dataclass(frozen=True)
class LoggerConfig:
    level: int = getattr(logging, getenv("LOGGING_LEVEL", "INFO").upper(), logging.INFO)
    
    @classmethod
    def setup(cls) -> None:
        logging.basicConfig(
            level=cls.level
        )

LOGGER_CONFIG = LoggerConfig()
