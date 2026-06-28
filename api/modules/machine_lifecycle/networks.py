from __future__ import annotations

import logging
import libvirt
import xml.etree.ElementTree as ET

from typing import Union
from uuid import UUID

from modules.libvirt_socket import LibvirtConnection
from modules.machine_lifecycle.xml_translator import get_required_xml_tag, get_required_xml_tag_attribute, parse_machine_xml, create_machine_network_interface_xml
from modules.machine_lifecycle.models import MachineNetworkInterface

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
    
    interface_xml = ET.tostring(create_machine_network_interface_xml(network_interface), encoding="unicode")
    
    if is_vm_running(machine_uuid):
        flags = libvirt.VIR_DOMAIN_AFFECT_LIVE | libvirt.VIR_DOMAIN_AFFECT_CONFIG
    else:
        flags = libvirt.VIR_DOMAIN_AFFECT_CONFIG

    with LibvirtConnection("rw") as libvirt_connection:
        machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
        
        machine.attachDeviceFlags(interface_xml, flags)    
        
def detach_network_interface(machine_uuid: UUID, mac_address: str):
    
    from modules.machine_state.state_management import is_vm_running
    
    """
    Detaches a network interface from a running machine.
    """
    
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