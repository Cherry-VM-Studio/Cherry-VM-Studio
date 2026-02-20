import libvirt

from typing import Optional
from xml.etree import ElementTree


XML_NAME_SCHEMA = {"vm": "http://example.com/virtualization"} 


def get_element_from_machine_xml(machine: libvirt.virDomain, *tags: str) -> Optional[ElementTree.Element]:
    root = ElementTree.fromstring(machine.XMLDesc())
    element = root
    
    for tag in tags:
        element = element.find(tag, XML_NAME_SCHEMA)
        if element is None:
            return None
        
    return element


def get_element_from_machine_xml_as_text(machine: libvirt.virDomain, *tags: str) -> Optional[str]:
    element = get_element_from_machine_xml(machine, *tags)
    return element.text if element is not None else None