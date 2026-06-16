from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from config.permissions_config import PERMISSIONS
from modules.authentication.validation import DependsOnAdministrativeAuthentication, get_authenticated_administrator
from modules.machine_state.queries import check_machine_access, check_machine_existence
from modules.network_configuration.models import NetworkConfiguration, NetworkWorkspace, Positions
from modules.network_configuration.configuration import get_current_network_configuration, get_flow_node_positions, save_flow_node_positions, set_network_configuration
from modules.network_configuration.validation import validate_machines_in_network_configuration
from modules.users.permissions import has_permissions
from modules.users.users import UsersManager

router = APIRouter(
    prefix='/network',
    dependencies=[Depends(get_authenticated_administrator)]
)

@router.get("/workspace", response_model=NetworkWorkspace, tags=['Network Configuration'])
def __get_current_network_configuration__(current_user: DependsOnAdministrativeAuthentication) -> NetworkWorkspace:
    return jsonable_encoder(NetworkWorkspace(
        configuration=get_current_network_configuration(current_user.uuid),
        positions=get_flow_node_positions(current_user.uuid)
    ))
    
@router.get("/workspace/{uuid}", response_model=NetworkWorkspace, tags=['Network Configuration'])
def __get_current_network_configuration_for_other_user__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> NetworkWorkspace:
    
    if uuid != current_user.uuid and not has_permissions(current_user, PERMISSIONS.VIEW_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to access this resource.")
    
    if not UsersManager.get_user(uuid):
        raise HTTPException(404, f"User with UUID={uuid} does not exist.")
    
    return jsonable_encoder(NetworkWorkspace(
        configuration=get_current_network_configuration(uuid),
        positions=get_flow_node_positions(uuid)
    ))


@router.put("/configuration/networks", tags=['Network Configuration'])
def __apply_network_configuration_to_vms__(network_configuration: NetworkConfiguration, current_user: DependsOnAdministrativeAuthentication) -> None:
    validate_machines_in_network_configuration(network_configuration, current_user)
    set_network_configuration(current_user.uuid, network_configuration)
    
    
@router.put("/configuration/networks/{uuid}", tags=['Network Configuration'])
def __apply_network_configuration_to_other_user_vms__(uuid: UUID, network_configuration: NetworkConfiguration, current_user: DependsOnAdministrativeAuthentication) -> None:
    
    if uuid != current_user.uuid and not has_permissions(current_user, PERMISSIONS.VIEW_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to access this resource.")
    
    if not UsersManager.get_user(uuid):
        raise HTTPException(404, f"User with UUID={uuid} does not exist.")
    
    validate_machines_in_network_configuration(network_configuration, current_user)
    set_network_configuration(uuid, network_configuration)
    
    
@router.put("/configuration/positions", tags=['Network Configuration'])
def __save_own_flow_state__(positions: Positions, current_user: DependsOnAdministrativeAuthentication) -> None:
    save_flow_node_positions(current_user.uuid, positions)
    

@router.put("/configuration/positions/{uuid}", tags=['Network Configuration'])
def __save_flow_state_for_user__(uuid: UUID, positions: Positions, current_user: DependsOnAdministrativeAuthentication) -> None:
    if uuid != current_user.uuid and not has_permissions(current_user, PERMISSIONS.VIEW_ALL_VMS):
        raise HTTPException(403, "You do not have the necessary permissions to access this resource.")
    
    if not UsersManager.get_user(uuid):
        raise HTTPException(404, f"User with UUID={uuid} does not exist.")
    
    save_flow_node_positions(uuid, positions)