import logging
from uuid import UUID
from fastapi.encoders import jsonable_encoder
from psycopg.types.json import Jsonb
from .models import NetworkConfigurationSet, NetworkConfigurationGet, Positions
from modules.postgresql import pool, select_one
from modules.postgresql.simple_select import select_rows, select_single_field

logger = logging.getLogger(__name__)

def get_current_network_configuration(owner_uuid: UUID) -> NetworkConfigurationGet:
    
    internal_networks = {}
    machines_with_internet_access = []
    
    owner_internal_networks = select_rows("SELECT * FROM intnets WHERE owner_uuid = %s", (owner_uuid,))
    
    if owner_internal_networks is not None:

        for intnet in owner_internal_networks:
            
            intnet_uuid = intnet["uuid"]
            intnet_name = intnet["intnet_name"]
            bridge_mac = intnet["bridge_mac"]
            bridge_ip = intnet["bridge_ip"]
            
            machines = select_rows("SELECT machine_uuid, interface_mac FROM intnets_connections WHERE intnet_uuid = %s", (intnet_uuid,))
            machines_dict = {machine["machine_uuid"]: machine["interface_mac"] for machine in machines}
            
            internal_networks[intnet_uuid] = {
                "uuid": intnet_uuid,
                "intnet_name": intnet_name,
                "bridge_mac": bridge_mac,
                "bridge_ip": bridge_ip,
                "machines": machines_dict
            }
        
    # Get a list of machines with internet access belonging to the owner
    select_machines_with_internet_access = """
    SELECT * FROM deployed_machines_owners
    INNER JOIN internet_connections ON deployed_machines_owners.machine_uuid = internet_connections.machine_uuid
    WHERE deployed_machines_owners.owner_uuid = %s
    """
        
    machines_with_internet_access = select_single_field("machine_uuid", select_machines_with_internet_access, (owner_uuid,))
        
    return NetworkConfigurationGet(
        internal_networks=internal_networks,
        machines_with_internet_access=machines_with_internet_access
    )


def set_network_configuration(owner_uuid: UUID, configuration: NetworkConfigurationSet):

    from modules.machine_lifecycle.networks import create_internal_network, delete_internal_network, modify_internal_network, attach_internet_interface, detach_internet_interface

    internal_networks_db = set(select_single_field("uuid", "SELECT * FROM intnets WHERE owner_uuid = %s", (owner_uuid,)))
    internal_networks_incoming = set(configuration.internal_networks.keys())
    
    internet_connections_db = set(select_single_field("machine_uuid", "SELECT * FROM deployed_machines_owners INNER JOIN internet_connections ON deployed_machines_owners.machine_uuid = internet_connections.machine_uuid WHERE deployed_machines_owners.owner_uuid = %s", (owner_uuid,)))
    internet_connections_incoming = set(configuration.machines_with_internet_access)
    
    # This approach uses sets to determine changes in the networks configuration.
    
    # Intnet UUID present in the DB, absent in the incoming configuration.
    deleted_intnets = internal_networks_db - internal_networks_incoming
    
    # Intnet UUID absent in the DB, present in the incoming configuration.
    new_intnets = internal_networks_incoming - internal_networks_db
    
    # Intnet UUID present in the DB, present in the incoming configuration.
    # This means that the intnet configuration could have been changed or the intnet was left unchanged.
    existing_intnets = internal_networks_incoming & internal_networks_db
    
    # Internet connection UUID present in the DB, absent in the incoming configuration.
    deleted_internet_connections = internet_connections_db - internet_connections_incoming
    
    # Internet connection UUID absent in the DB, present in the incoming configuration.
    new_internet_connections = internet_connections_incoming - internet_connections_db
    
    for intnet_uuid in deleted_intnets:
        delete_internal_network(intnet_uuid)
        
    for intnet_uuid in new_intnets:
        intnet_config = configuration.internal_networks[intnet_uuid]
        
        if intnet_config.machines is not None:
            create_internal_network(owner_uuid, intnet_config)
    
    for intnet_uuid in existing_intnets:
        intnet_config = configuration.internal_networks[intnet_uuid]
        modify_internal_network(intnet_uuid, intnet_config)
    
    for machine_uuid in deleted_internet_connections:
        detach_internet_interface(machine_uuid)
        
    for machine_uuid in new_internet_connections:
        attach_internet_interface(machine_uuid)

def get_flow_node_positions(owner_uuid: UUID) -> Positions:
    row = select_one("SELECT positions FROM network_panel_states WHERE owner_uuid = %s", [owner_uuid]);
    if not row:
        return {}
    return row["positions"]

def save_flow_node_positions(owner_uuid: UUID, positions: Positions):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM network_panel_states WHERE owner_uuid = %s", [owner_uuid])
            cursor.execute("INSERT INTO network_panel_states (owner_uuid, positions) VALUES (%s, %s)", [owner_uuid, Jsonb(jsonable_encoder(positions))])
            connection.commit()
            
            
            
    
    