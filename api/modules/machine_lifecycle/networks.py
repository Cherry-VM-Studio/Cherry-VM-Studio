from __future__ import annotations

import logging
import libvirt
import xml.etree.ElementTree as ET

from typing import Union
from uuid import UUID

from modules.libvirt_socket import LibvirtConnection
from modules.machine_lifecycle.xml_translator import get_required_xml_tag, get_required_xml_tag_attribute, parse_machine_xml

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