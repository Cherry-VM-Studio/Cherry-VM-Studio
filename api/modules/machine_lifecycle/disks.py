from __future__ import annotations

import logging
import libvirt
import xml.etree.ElementTree as ET

from uuid import UUID, uuid4

from modules.libvirt_socket import LibvirtConnection
from modules.machine_lifecycle.models import MachineDisk, MachineParameters
from config.env_config import ENV_CONFIG

logger = logging.getLogger(__name__)

def create_machine_disk(machine_disk: MachineDisk) -> UUID:
    with LibvirtConnection("rw") as libvirt_connection:
        try:
            storage_pool = libvirt_connection.storagePoolLookupByName(machine_disk.pool)
            
            if storage_pool is None:
                raise Exception(f"Could not find {machine_disk.pool} storage pool")

            if not storage_pool.isActive():
                storage_pool.create()
            
            volume_root = ET.Element("volume")
            
            volume_name = ET.SubElement(volume_root, "name")
            volume_uuid = uuid4()
            volume_name.text = f"{str(volume_uuid)}.{machine_disk.type}"
            
            # volume_description = ET.SubElement(volume_root, "description")
            # volume_description.text = machine_disk.name
            
            volume_capacity = ET.SubElement(volume_root, "capacity")
            # volume_capacity.text = str(bytes_to_mib(machine_disk.size))
            volume_capacity.text = str(machine_disk.size)
            
            volume_target = ET.SubElement(volume_root, "target")
            ET.SubElement(volume_target, "format", type=machine_disk.type)
            
            volume_permissions = ET.SubElement(volume_target, "permissions")
            permissions_mode = ET.SubElement(volume_permissions, "mode")
            permissions_mode.text = "0660"
            permissions_owner = ET.SubElement(volume_permissions, "owner")
            permissions_owner.text = f"{ENV_CONFIG.SYSTEM_WORKER_UID}"
            permissions_group = ET.SubElement(volume_permissions, "group")
            permissions_group.text = f"{ENV_CONFIG.SYSTEM_WORKER_GID}"
            
            volume_xml = ET.tostring(volume_root, encoding="unicode")
            
            # logger.info(volume_xml)
            
            storage_pool.createXML(volume_xml)
            
            return volume_uuid
            
        except libvirt.libvirtError as e:
            raise Exception(f"Failed to create machine disk (volume): {e}")

    
def delete_machine_disk(disk_uuid: UUID, pool: str) -> bool:
    storage_pool: libvirt.virStoragePool
    volume: libvirt.virStorageVol
    
    volume_prefix = str(disk_uuid)
    
    with LibvirtConnection("rw") as libvirt_connection:
        try:
            storage_pool = libvirt_connection.storagePoolLookupByName(pool)
            if storage_pool is None:
                raise Exception(f"Could not find {pool} storage pool.")

            if not storage_pool.isActive():
                logger.debug(f"Activating inactive storage pool {pool}.")
                storage_pool.create()

            volumes = storage_pool.listAllVolumes()
            if volumes is None:
                raise Exception(f"Could not find volumes in {pool} storage pool.")
            
            matched_volumes = [volume for volume in volumes if volume.name().startswith(volume_prefix)]
            
            if matched_volumes is None:
                logger.warning(f"No volume in pool {pool} matches UUID {disk_uuid}")
                return False
            
            for volume in matched_volumes:
                logger.info(f"Deleting volume {disk_uuid} from pool {pool}.")
                volume.delete()

            return True
        
        except libvirt.libvirtError as e:
            logger.exception(f"Failed to delete machine disk (volume): {e}")
            return False


def machine_disks_cleanup(machine_parameters: MachineParameters) -> bool:
    try:
        logger.info(f"Machine disk cleanup called for machine {machine_parameters.uuid}.")
        system_disk = machine_parameters.system_disk
        additional_disks = machine_parameters.additional_disks
            
        if not system_disk.uuid:
            raise ValueError("Invalid MachineParameters model.\nmachine_disks_cleanup() requires a model with valid disk UUIDs.")
        delete_machine_disk(system_disk.uuid, system_disk.pool)
            
        if additional_disks is not None:
            for disk in additional_disks:
                assert disk.uuid is not None
                delete_machine_disk(disk.uuid, disk.pool)
                
    except Exception as e:
        logger.exception(f"Failed machine {machine_parameters.uuid} disk cleanup: {e}")
        return False
    return True


def get_machine_disk_size(disk_uuid: UUID, pool: str) -> int:
    storage_pool: libvirt.virStoragePool
    volume: libvirt.virStorageVol
    
    volume_prefix = str(disk_uuid)
    volume_size = 0
    
    with LibvirtConnection("ro") as libvirt_connection:
        try:
            storage_pool = libvirt_connection.storagePoolLookupByName(pool)
                
            if storage_pool is None:
                raise Exception(f"Could not find {pool} storage pool")

            if not storage_pool.isActive():
                storage_pool.create()
            
            volumes = storage_pool.listAllVolumes()
            if volumes is None:
                raise Exception(f"Could not find volumes in {pool} storage pool.")
            
            matched_volumes = [volume for volume in volumes if volume.name().startswith(volume_prefix)]
            
            if matched_volumes is None:
                raise Exception(f"No volume in pool {pool} matches UUID {disk_uuid}.")
            
            for volume in matched_volumes:
                volume_size = volume.info()[1]

            return volume_size
        
        except libvirt.libvirtError as e:
            raise Exception(f"Failed to fetch machine disk (volume) size: {e}.")