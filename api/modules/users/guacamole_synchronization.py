import logging
from typing import Any
from uuid import UUID
from fastapi import HTTPException
from psycopg import Cursor

logger = logging.getLogger(__name__)

def create_entity(cursor: Cursor[Any], user_uuid: UUID):
    cursor.execute("""
        INSERT INTO guacamole_entity (name, type)
        VALUES (%s, 'USER') 
        RETURNING entity_id
    """, (user_uuid, ))
    
    entity_insert_result = cursor.fetchone()

    if entity_insert_result is None:
        logger.error(f"Failed to retrieve entity_id from guacamole_user insert query for user_uuid={user_uuid}.")
        raise HTTPException(500, f"Failed to create the user due to an internal issue.")
    
    entity_id = entity_insert_result["entity_id"]
    
    cursor.execute("""
        INSERT INTO guacamole_user (entity_id, password_hash, password_date, disabled, expired)
        VALUES (%s, '', NOW(), FALSE, FALSE) 
    """, (entity_id, ))
    
    return entity_id


def delete_entity(cursor: Cursor[Any], user_uuid: UUID):
    cursor.execute(f"DELETE FROM guacamole_entity WHERE name = %s::varchar", (user_uuid,))
