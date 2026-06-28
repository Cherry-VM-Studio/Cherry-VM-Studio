from __future__ import annotations

import logging
import libvirt
import xml.etree.ElementTree as ET

from typing import Union
from uuid import UUID

from modules.libvirt_socket import LibvirtConnection
from modules.machine_lifecycle.xml_translator import get_required_xml_tag, get_required_xml_tag_attribute, parse_machine_xml, create_machine_network_interface_xml
from modules.machine_lifecycle.models import MachineNetworkInterface, internet_interface
from modules.postgresql.main import pool
from modules.postgresql.simple_select import select_single_field

logger = logging.getLogger(__name__)

def get_network_bridge_ip(network_id: Union[UUID, str]) -> str:
    """
    Finds IP address of network's bridge element.
    """
    with LibvirtConnection("ro") as libvirt_connection:
        if isinstance(network_id, UUID):
            network = libvirt_connection.networkLookupByUUID(network_id.bytes)
        else:
            network = libvirt_connection.networkLookupByName(network_id)
        
        network_xml = network.XMLDesc()
        
    network_root = ET.fromstring(network_xml)
    
    ip = get_required_xml_tag(network_root, "ip")
    
    bridge_ip = get_required_xml_tag_attribute(ip, "address")
        
    return bridge_ip

def get_machine_framebuffer_port(machine_uuid: UUID) -> str:
    """
    Find framebuffer port of a given machine.
    """
    with LibvirtConnection("ro") as libvirt_connection:
        machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
        
        machine_xml = machine.XMLDesc()
        
        machine_parameters = parse_machine_xml(machine_xml)
        
        framebuffer_port = machine_parameters.framebuffer.port
        
        if framebuffer_port is None:
            raise Exception(f"Failed to extract framebuffer port of {machine_uuid}")
        
        return framebuffer_port


def attach_network_interface(machine_uuid: UUID, network_interface: MachineNetworkInterface):
    """
    Attaches a network interface to a running machine.
    """
    
    from modules.machine_state.state_management import is_vm_running
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                try:
                    logger.debug(f"Attaching network interface {network_interface.name} to machine {machine_uuid}")
                    
                    interface_xml = ET.tostring(create_machine_network_interface_xml(network_interface), encoding="unicode")
                    
                    if is_vm_running(machine_uuid):
                        flags = libvirt.VIR_DOMAIN_AFFECT_LIVE | libvirt.VIR_DOMAIN_AFFECT_CONFIG
                    else:
                        flags = libvirt.VIR_DOMAIN_AFFECT_CONFIG

                    with LibvirtConnection("rw") as libvirt_connection:
                        machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
                        
                        machine.attachDeviceFlags(interface_xml, flags)    
                        
                    if network_interface.name == internet_interface.name:
                        # If given network interface is the Internet interface a different table needs to be updated in the database 
                        cursor.execute(
                            "INSERT INTO internet_connections (machine_uuid, interface_mac) VALUES (%s, %s)",
                            (machine_uuid, network_interface.mac)
                        )
                    else:
                        # Otherwise the network interface is a regular one and should be added to the machine's network interfaces table
                        pass
                        
                except libvirt.libvirtError as e:
                    raise Exception(f"Failed to attach network interface {network_interface.name} to machine {machine_uuid} because of Libvirt error: {e}")
                    
                except Exception as e:
                    raise Exception(f"Failed to attach network interface {network_interface.name} to machine {machine_uuid}: {e}")
    

def detach_network_interface(machine_uuid: UUID, mac_address: str):
    
    from modules.machine_state.state_management import is_vm_running
    
    """
    Detaches a network interface from a running machine.
    """
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                try:
                    logger.debug(f"Detaching network interface with MAC {mac_address} from machine {machine_uuid}")
                    
                    interface_minimal_xml = f"""
                    <interface>
                        <mac address="{mac_address}"/>
                    </interface>
                    """
                    
                    if is_vm_running(machine_uuid):
                        flags = libvirt.VIR_DOMAIN_AFFECT_LIVE | libvirt.VIR_DOMAIN_AFFECT_CONFIG
                    else:
                        flags = libvirt.VIR_DOMAIN_AFFECT_CONFIG

                    with LibvirtConnection("rw") as libvirt_connection:
                        machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
                        
                        machine.detachDeviceFlags(interface_minimal_xml, flags)
                    
                    # No checking is done here to ensure whether the interface being detached is the Internet interface or a regular one. 
                    # Both cases are handled by deleting the interface from both tables in the database as this is significantly faster than checking the interface type first and then deleting it from the appropriate table.
                    cursor.execute("DELETE FROM internet_connections WHERE machine_uuid = %s AND interface_mac = %s", (machine_uuid, mac_address))
                    cursor.execute("DELETE FROM intnets_connections WHERE machine_uuid = %s AND interface_mac = %s", (machine_uuid, mac_address))
                    
                    
                except libvirt.libvirtError as e:
                    raise Exception(f"Failed to detach network interface with MAC {mac_address} from machine {machine_uuid} because of Libvirt error: {e}")
                    
                except Exception as e:
                    raise Exception(f"Failed to detach network interface {network_interface.name} from machine {machine_uuid}: {e}")

    
    
    
    
