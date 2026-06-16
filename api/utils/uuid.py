from uuid import UUID

def is_valid_uuid(uuid_string: str | UUID):
    if isinstance(uuid_string, UUID):
        return True
    
    try:
        uuid = UUID(uuid_string)
    except ValueError:
        return False
    return str(uuid) == uuid_string