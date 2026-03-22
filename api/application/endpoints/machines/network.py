from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from config.permissions_config import PERMISSIONS
from modules.authentication.validation import DependsOnAdministrativeAuthentication, get_authenticated_administrator
from modules.network_configuration.models import NetworkConfiguration, IntnetConfiguration, Positions
from modules.network_configuration.configuration import get_current_intnet_state, get_flow_node_positions, save_flow_node_positions, set_intnets
from modules.users.permissions import has_permissions
from modules.users.users import UsersManager

router = APIRouter(
    prefix='/network',
    dependencies=[Depends(get_authenticated_administrator)]
)

@router.get("/configuration", response_model=NetworkConfiguration, tags=['Network Configuration'])
def __get_current_network_configuration__(current_user: DependsOnAdministrativeAuthentication) -> NetworkConfiguration:
    return jsonable_encoder(NetworkConfiguration(
        intnets = get_current_intnet_state(),
        positions = get_flow_node_positions(current_user.uuid),
    ))
    
@router.get("/configuration/{uuid}", response_model=NetworkConfiguration, tags=['Network Configuration'])
def __get_current_network_configuration_for_other_user__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> NetworkConfiguration:
    
    if uuid != current_user.uuid and has_permissions(current_user, PERMISSIONS.VIEW_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to access this resource.")
    
    if not UsersManager.get_user(uuid):
        raise HTTPException(404, f"User with UUID={uuid} does not exist.")
    
    return jsonable_encoder(NetworkConfiguration(
        intnets = get_current_intnet_state(),
        positions = get_flow_node_positions(uuid),
    ))


@router.put("/configuration/intnets", tags=['Network Configuration'])
def __apply_intnet_configuration_to_vms__(intnet_configuration: IntnetConfiguration) -> None:
    set_intnets(intnet_configuration)
    
@router.put("/configuration/positions", tags=['Network Configuration'])
def __save_flow_state__(positions: Positions, current_user: DependsOnAdministrativeAuthentication) -> None:
    save_flow_node_positions(current_user.uuid, positions)