from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from modules.authentication.validation import DependsOnAdministrativeAuthentication, get_authenticated_administrator
from modules.network_configuration.models import NetworkConfiguration, IntnetConfiguration, Positions
from modules.network_configuration.configuration import get_current_intnet_state, get_flow_node_positions, save_flow_node_positions, set_intnets

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

@router.put("/configuration/intnets", tags=['Network Configuration'])
def __apply_intnet_configuration_to_vms__(intnet_configuration: IntnetConfiguration) -> None:
    set_intnets(intnet_configuration)
    
@router.put("/configuration/positions", tags=['Network Configuration'])
def __save_flow_state__(positions: Positions, current_user: DependsOnAdministrativeAuthentication) -> None:
    save_flow_node_positions(current_user.uuid, positions)