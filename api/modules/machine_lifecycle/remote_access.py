import logging

from uuid import UUID
from modules.machine_state.queries import get_machine_owner
from modules.postgresql import pool, select_one, select_single_field


logger = logging.getLogger(__name__)

def update_machine_clients(machine_uuid: UUID, clients_uuid: set[UUID]):
    
    # SELECT
    
    select_guacamole_entity_id = """
        SELECT entity_id FROM guacamole_entity WHERE name = %s::varchar;
    """
    
    select_guacamole_connection_id = """
        SELECT connection_id FROM guacamole_connection WHERE connection_name LIKE %s;
    """
    
    # DELETE
    
    delete_machine_clients = """
        DELETE FROM deployed_machines_clients WHERE machine_uuid = %s;
    """

    delete_guacamole_connection_permissions = """
        DELETE FROM guacamole_connection_permission WHERE connection_id = %s AND NOT entity_id = %s;
    """
  
    # INSERT
    
    insert_machine_clients = """
        INSERT INTO deployed_machines_clients (machine_uuid, client_uuid) VALUES (%s, %s);
    """
    
    insert_guacamole_connection_permission = """
        INSERT INTO guacamole_connection_permission (entity_id, connection_id, permission)
        VALUES (%s, %s, %s);
    """
    
    select_pattern = f"{machine_uuid}_%"

    owner = get_machine_owner(machine_uuid)
    if owner is not None:
        owner_uuid = owner.uuid
    else:
        raise Exception(f"Could not find machine owner for machine {machine_uuid}.")
    
    owner_entity = select_one(select_guacamole_entity_id, (owner_uuid,))
    if owner_entity is not None:
        owner_entity_id = owner_entity["entity_id"]
    else:
        raise Exception(f"Could not find corresponding guacamole entity_id for owner {owner_uuid}")
    
    machine_connections = select_single_field("connection_id", select_guacamole_connection_id, (select_pattern,))
    
    logger.debug(f"Updating {machine_uuid} clients records.")
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                
                # 1. Delete all deployed_machines_clients records for machine_uuid
                cursor.execute(delete_machine_clients, (machine_uuid,))
                
                # 2. Insert new clients into deployed_machines_clients table
                for client_uuid in clients_uuid:
                    cursor.execute(insert_machine_clients, (machine_uuid, client_uuid))
                
                # 3. Iterate over every connection type
                for connection_id in machine_connections:
                    
                    # 4. Delete all permissions from guacamole_connection_permission for machine_uuid except for the owner entity_id
                    cursor.execute(delete_guacamole_connection_permissions, (connection_id, owner_entity_id))

                    for client_uuid in clients_uuid:
                        
                        cursor.execute(select_guacamole_entity_id, (client_uuid,))
                        client_entity = cursor.fetchone()
                        
                        if client_entity:
                            client_entity_id = client_entity["entity_id"]
                        else:
                            raise Exception(f"Could not find corresponding guacamole entity_id for client {client_uuid}")
                        
                        # 5. Insert new client permissions - READ
                        cursor.execute(insert_guacamole_connection_permission, (client_entity_id, connection_id, "READ"))