from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class FilesConfig:
    upload_iso_directory = Path("data/iso/")
    upload_iso_max_size = 10 * 1024 * 1024 * 1024 # 10GB
    upload_timeout_seconds = 60
    

FILES_CONFIG = FilesConfig()