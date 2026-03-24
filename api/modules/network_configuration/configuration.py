from uuid import UUID
from fastapi.encoders import jsonable_encoder
from psycopg.types.json import Jsonb
from .models import NetworkConfiguration, NetworkConfiguration, Positions
from modules.postgresql import pool, select_one


# intnets

def get_current_network_configuration(owner_uuid: UUID) -> NetworkConfiguration:
    # TODO
    # should return network configuration for machines owned by owner_uuid
    
    return NetworkConfiguration(
        internal_networks={},
        machines_with_internet_access=[]
    )

def set_network_configuration(owner_uuid: UUID, configuration: NetworkConfiguration):
    # TODO
    # should save network configuration for the owner's workspace
    # already existing intnets should be modified
    # intnets that exist currently but in the new configuration aren't present should be removed
    # intnets that dont exist but are provided in the new configuration should be created
    #
    #
    pass
    
# flow state

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
            
            
            
    
    