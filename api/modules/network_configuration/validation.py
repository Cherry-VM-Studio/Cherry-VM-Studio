from fastapi import HTTPException

from config.permissions_config import PERMISSIONS
from modules.machine_state.queries import check_machine_access, check_machine_existence
from modules.network_configuration.models import NetworkConfiguration
from modules.users.models import AdministratorExtended
from modules.users.permissions import has_permissions


def validate_machines_in_network_configuration(network_configuration: NetworkConfiguration, logged_in_user: AdministratorExtended):
    machine_uuids = set(*network_configuration.machines_with_internet_access)
    
    for intnet in network_configuration.internal_networks.values():
        for machine_uuid in intnet.machines:
            machine_uuids.add(machine_uuid)
            
    can_manage_all = has_permissions(logged_in_user, PERMISSIONS.MANAGE_ALL_VMS)
            
    for machine_uuid in machine_uuids:
        if not check_machine_existence(machine_uuid):
            raise HTTPException(404, f"Virtual machine with UUID={machine_uuid} could not be found.")
        if not can_manage_all and not check_machine_access(machine_uuid, logged_in_user):
            raise HTTPException(403, f"You do not have the necessary permissions to manage machine with UUID={machine_uuid}.")
    
    return True