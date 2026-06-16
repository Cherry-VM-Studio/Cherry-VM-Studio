from dataclasses import MISSING, dataclass, fields

@dataclass(frozen=True)
class Permissions:
    VIEW_ALL_VMS            : int = 1 << 0
    MANAGE_ALL_VMS          : int = 1 << 1
    MANAGE_CLIENT_USERS     : int = 1 << 2
    MANAGE_ADMIN_USERS      : int = 1 << 3
    CHANGE_CLIENT_PASSWORD  : int = 1 << 4
    CHANGE_ADMIN_PASSWORD   : int = 1 << 5
    MANAGE_ISO_FILES        : int = 1 << 6
    MANAGE_SYSTEM_RESOURCES : int = 1 << 7
    
    @classmethod
    def get_max_permissions(cls) -> int:
        return sum(field.default for field in fields(cls) if field.default is not MISSING)
    
PERMISSIONS = Permissions()