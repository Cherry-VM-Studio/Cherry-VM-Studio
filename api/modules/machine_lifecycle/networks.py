from __future__ import annotations

import logging
import libvirt
import xml.etree.ElementTree as ET

from typing import Union
from uuid import UUID, uuid4

from modules.libvirt_socket import LibvirtConnection
from modules.machine_lifecycle.xml_translator import get_required_xml_tag, get_required_xml_tag_attribute, parse_machine_xml, create_machine_network_interface_xml
from modules.machine_lifecycle.models import MachineNetworkInterface, InternetInterface
from modules.postgresql.main import pool
from modules.network_configuration.models import InternalNetworkSetForm
from utils.mac import generate_random_mac

logger = logging.getLogger(__name__)

################################
#   Remote access networking
################################
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

################################
# Internet gateway attachment
################################
def attach_internet_interface(machine_uuid: UUID):
    """
    Attaches an Internet interface to a running machine.
    """
    
    internet_interface = InternetInterface()
    
    internet_interface.mac = generate_random_mac()
    
    from modules.machine_state.state_management import is_vm_running
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                try:
                    logger.debug(f"Attaching Internet interface {internet_interface.name} to machine {machine_uuid}")
                    
                    interface_xml = ET.tostring(create_machine_network_interface_xml(internet_interface), encoding="unicode")
                    
                    if is_vm_running(machine_uuid):
                        flags = libvirt.VIR_DOMAIN_AFFECT_LIVE | libvirt.VIR_DOMAIN_AFFECT_CONFIG
                    else:
                        flags = libvirt.VIR_DOMAIN_AFFECT_CONFIG

                    with LibvirtConnection("rw") as libvirt_connection:
                        machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
                        
                        machine.attachDeviceFlags(interface_xml, flags)    
                        
                        cursor.execute(
                            "INSERT INTO internet_connections (machine_uuid, interface_mac) VALUES (%s, %s)",
                            (machine_uuid, internet_interface.mac)
                        )
                        
                except libvirt.libvirtError as e:
                    raise Exception(f"Failed to attach Internet interface {internet_interface.name} to machine {machine_uuid} because of Libvirt error: {e}")
                    
                except Exception as e:
                    raise Exception(f"Failed to attach Internet interface {internet_interface.name} to machine {machine_uuid}: {e}")
    
def detach_internet_interface(machine_uuid: UUID):
    """
    Detaches an Internet interface from a running machine.
    """
    
    from modules.machine_state.state_management import is_vm_running
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                try:
                    logger.debug(f"Detaching Internet interface from machine {machine_uuid}")
                    
                    cursor.execute("SELECT interface_mac FROM internet_connections WHERE machine_uuid = %s;", (machine_uuid,))
                        
                    internet_interface_result = cursor.fetchone()
                        
                    if internet_interface_result is not None:
                        internet_interface_mac = internet_interface_result["interface_mac"]
                    else:
                        raise Exception(f"Failed to find Internet interface for machine {machine_uuid} in the database.")
                    
                    interface_minimal_xml = f"""
                    <interface>
                        <mac address="{internet_interface_mac}"/>
                    </interface>
                    """
                    
                    if is_vm_running(machine_uuid):
                        flags = libvirt.VIR_DOMAIN_AFFECT_LIVE | libvirt.VIR_DOMAIN_AFFECT_CONFIG
                    else:
                        flags = libvirt.VIR_DOMAIN_AFFECT_CONFIG

                    with LibvirtConnection("rw") as libvirt_connection:
                        machine = libvirt_connection.lookupByUUID(machine_uuid.bytes)
                        
                        machine.detachDeviceFlags(interface_minimal_xml, flags)
                    
                    cursor.execute("DELETE FROM internet_connections WHERE machine_uuid = %s AND interface_mac = %s", (machine_uuid, internet_interface_mac))
                    
                    
                except libvirt.libvirtError as e:
                    raise Exception(f"Failed to detach Internet interface from machine {machine_uuid} because of Libvirt error: {e}")
                    
                except Exception as e:
                     raise Exception(f"Failed to detach Internet interface from machine {machine_uuid}: {e}")

################################
# Internal networks attachment
################################
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
                    
                    cursor.execute("INSERT INTO intnets_connections (intnet_uuid, machine_uuid, interface_mac, interface_ip, interface_name) VALUES (%s, %s, %s, %s, %s)", 
                                   (machine_uuid, network_interface.mac, network_interface.ip, network_interface.name)
                                   )
                        
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

                    cursor.execute("DELETE FROM intnets_connections WHERE machine_uuid = %s AND interface_mac = %s", (machine_uuid, mac_address))
                    
                except libvirt.libvirtError as e:
                    raise Exception(f"Failed to detach network interface with MAC {mac_address} from machine {machine_uuid} because of Libvirt error: {e}")
                    
                except Exception as e:
                    raise Exception(f"Failed to detach network interface with MAC {mac_address} from machine {machine_uuid}: {e}")

################################
#   Internal networks
################################
def create_internal_network(owner_uuid: UUID, internal_network_set_form: InternalNetworkSetForm):
    """
    Creates a new internal network.
    """

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                try:
                    logger.debug("Creating a new internal network")
                    
                    internal_network_uuid = uuid4()
                    bridge_mac = generate_random_mac()
                    
                    internal_network_xml_lines = [
                        "<network>",
                        f"<name>{internal_network_set_form.intnet_name}</name>",
                        f"<uuid>{internal_network_uuid}</uuid>",
                        f"<mac address='{bridge_mac}'/>"
                    ]
                    
                    if internal_network_set_form.bridge_ip is not None:
                        internal_network_xml_lines.append(f"<ip address='{internal_network_set_form.bridge_ip.ip}' netmask='{internal_network_set_form.bridge_ip.netmask}'/>")
                    
                    internal_network_xml_lines.append("</network>")
                    
                    internal_network_xml = "\n".join(internal_network_xml_lines)
                    
                    with LibvirtConnection("rw") as libvirt_connection:
                        network = libvirt_connection.networkDefineXML(internal_network_xml)
                        network.autostart()
                        network.create()
                        
                    cursor.execute("INSERT INTO intets (uuid, owner_uuid, intent_name, bridge_name, bridge_mac, bridge_ip) VALUES (%s, %s, %s, %s, %s, %s)", (
                        internal_network_uuid,
                        owner_uuid,
                        internal_network_set_form.intnet_name,
                        internal_network_set_form.bridge_name,
                        bridge_mac,
                        internal_network_set_form.bridge_ip
                    ))

                except libvirt.libvirtError as e:
                    raise Exception(f"Failed to create internal network {internal_network_set_form.intnet_name} because of Libvirt error: {e}")
                    
                except Exception as e:
                    raise Exception(f"Failed to create internal network {internal_network_set_form.intnet_name}: {e}")

def remove_internal_network(intent_uuid: UUID):
    """
    Removes an existing internal network.
    """
    
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            with connection.transaction():
                try:
                    logger.debug(f"Removing internal network {intent_uuid}")
                    
                    with LibvirtConnection("rw") as libvirt_connection:
                        network = libvirt_connection.networkLookupByUUID(intent_uuid.bytes)
                        network.destroy()
                        network.undefine()
                        
                    cursor.execute("DELETE FROM intnets WHERE uuid = %s", (intent_uuid,))
                    
                except libvirt.libvirtError as e:
                    raise Exception(f"Failed to remove internal network {intent_uuid} because of Libvirt error: {e}")
                    
                except Exception as e:
                    raise Exception(f"Failed to remove internal network {intent_uuid}: {e}")