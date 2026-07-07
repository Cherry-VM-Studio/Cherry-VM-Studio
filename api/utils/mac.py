import logging
import random
from pydantic_extra_types.mac_address import MacAddress

logger = logging.getLogger(__name__)

def generate_random_mac() -> MacAddress:
    """
    Generates a random MAC address with the prefix 52:54:00 (QEMU/KVM).
    """
    mac_prefix = [0x52, 0x54, 0x00]
    mac_suffix = [random.randint(0x00, 0xFF) for _ in range(3)]
    mac_address = mac_prefix + mac_suffix
    
    # Formatted as lowercase hexadecimal with colons
    mac_str =  ':'.join(f'{byte:02x}' for byte in mac_address)
    
    return MacAddress(mac_str)