from uuid import UUID
from fastapi.encoders import jsonable_encoder
from psycopg.types.json import Jsonb
from .models import IntnetConfiguration, Positions
from modules.postgresql import pool, select_one


# intnets

def get_current_intnet_state(owner_uuid: UUID) -> IntnetConfiguration:
    # should return only intnets for the owner's machines
    return {}

def apply_intnet_changes(intnets: IntnetConfiguration):
    # should merge current intnet configuration with the new one
    # provided intnets should be updated/created
    # intnets that exist but are not provided in the intnets prop should stay unchanged 
    #
    # intnet with UUID = 00000000-0000-0000-0000-000000000000 represents the **internet gateway**
    #
    return
    
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
            
            
            
    
    