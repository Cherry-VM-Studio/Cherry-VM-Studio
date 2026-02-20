import logging
from typing import Literal
from uuid import UUID
from datetime import datetime

from api.modules.libvirt_socket import LibvirtConnection
from modules.authentication.validation import encode_guacamole_connection_string
from modules.users.permissions import is_admin, is_client
from modules.postgresql.simple_select import select_single_field
from modules.users.models import Administrator, AnyUser, Client
from modules.users.sublibraries.administrator_library import AdministratorLibrary
from modules.users.sublibraries.client_library import ClientLibrary
from config import ENV_CONFIG

logger = logging.getLogger(__name__)



def get_machine_owner(machine_uuid: UUID) -> Administrator | None:
    owner_uuids =  select_single_field("uuid", """
        SELECT administrators.uuid FROM administrators
        RIGHT JOIN deployed_machines_owners ON administrators.uuid = deployed_machines_owners.owner_uuid
        WHERE deployed_machines_owners.machine_uuid = %s
    """, (machine_uuid,))
        
    if owner_uuids:
        if len(owner_uuids) > 1:
            logger.error(f"Machine with uuid={machine_uuid} has multiple owners. This may lead to unexpected behavior!")
            
        return AdministratorLibrary.get_record_by_uuid(owner_uuids[0])



def get_clients_assigned_to_machine(machine_uuid: UUID) -> dict[UUID, Client]:
    assigned_client_uuids = select_single_field("uuid", """
        SELECT clients.uuid FROM clients
        RIGHT JOIN deployed_machines_clients ON clients.uuid = deployed_machines_clients.client_uuid
        WHERE deployed_machines_clients.machine_uuid = %s
    """, (machine_uuid,))
    
    return ClientLibrary.get_all_records_matching("uuid", assigned_client_uuids)


def get_owner_machine_uuids(owner: Administrator) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT DISTINCT machine_uuid FROM deployed_machines_owners WHERE owner_uuid = %s", (owner.uuid,))


def get_client_machine_uuids(client: Client) -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT DISTINCT machine_uuid FROM deployed_machines_clients WHERE client_uuid = %s", (client.uuid,))


def get_all_machine_uuids() -> list[UUID]:
    return select_single_field("machine_uuid", "SELECT DISTINCT machine_uuid FROM deployed_machines_owners")


def get_user_machine_uuids(user: AnyUser) -> list[UUID]:
    if is_admin(user): 
        return get_owner_machine_uuids(user)
    elif is_client(user): 
        return get_client_machine_uuids(user)
    return []


def check_machine_ownership(machine_uuid: UUID, user: AnyUser) -> bool:
    machine_owner = get_machine_owner(machine_uuid)
    return machine_owner is not None and machine_owner.uuid == user.uuid


def check_machine_access(machine_uuid: UUID, user: AnyUser) -> bool:
    if is_admin(user):
        return check_machine_ownership(machine_uuid, user)
    if is_client(user):
        assigned_clients = get_clients_assigned_to_machine(machine_uuid)
        return user.uuid in assigned_clients
    return False


def get_active_connections(machine_uuid: UUID) -> list[UUID]:
    
    # Either <machine_uuid>_rdp or <machine_uuid>_vnc
    regex_pattern = f"^{machine_uuid}_(vnc|rdp)$"
    
    select_connected_uuids = """
        SELECT DISTINCT gch.username 
        FROM guacamole_connection_history gch
        JOIN guacamole_connection gc ON gch.connection_id = gc.connection_id
        WHERE gc.connection_name ~ %s
        AND gch.end_date IS NULL;
    """
    
    connected_uuids = select_single_field("username", select_connected_uuids, (regex_pattern, ))
   
    return connected_uuids


def get_machine_boot_timestamp(machine_uuid: UUID) -> datetime | None:
    select_machine_boot_timestamp = """
        SELECT started_at FROM deployed_machines_owners WHERE machine_uuid = %s;
    """
    
    boot_timestamp = select_single_field("started_at", select_machine_boot_timestamp, (machine_uuid,))[0]

    if boot_timestamp is not None:
        return datetime.fromisoformat(str(boot_timestamp))
    
    return None


def get_machine_connections(machine_uuid: UUID) -> dict[Literal["ssh", "rdp", "vnc"], str]:
    
    regex_pattern = f"^{machine_uuid}_.*$"
    
    select_connection = """
        SELECT protocol FROM guacamole_connection WHERE connection_name ~ %s
    """
    
    available_protocols = select_single_field("protocol", select_connection, (regex_pattern,))

    connections: dict[Literal["ssh", "rdp", "vnc"], str] = {}
    
    for protocol in available_protocols:
        encoded_connection_string = encode_guacamole_connection_string(machine_uuid, protocol)
        # connections[protocol] = f"https://session.{ENV_CONFIG.DOMAIN_NAME}/{protocol}/{machine_uuid}"
        connections[protocol] = f"http://{ENV_CONFIG.DOMAIN_NAME}/guacamole/#/client/{encoded_connection_string}"
        
        
    return connections


def check_machine_membership(machine_uuid: UUID) -> bool:
    query_uuid_in_db = select_single_field("machine_uuid", "SELECT machine_uuid FROM deployed_machines_owners WHERE machine_uuid = %s", (machine_uuid, ))
    
    if not query_uuid_in_db:
        logger.debug(f"Machine {machine_uuid} not found in the database. Not a member!")
        return False
    
    machine_uuid_in_db = query_uuid_in_db[0]
    logger.debug(f"machine_uuid_in_db: {machine_uuid_in_db}")
    
    return machine_uuid == machine_uuid_in_db


def check_machine_existence(uuid: UUID) -> bool:  
    with LibvirtConnection("ro") as libvirt_readonly_connection:
        return libvirt_readonly_connection.lookupByUUID(uuid.bytes) is not None
