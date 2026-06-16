from uuid import UUID
import libvirt
import logging
from typing import Literal
from modules.exceptions.models import RaisedException

###############################
#   connection definition
###############################
class LibvirtConnection():
    hypervisor_uri = "qemu:///system"
    
    def __init__(self, type: Literal["ro", "rw"]):
        self.type = type
        self.connection = None
        
        match self.type:
            case "ro":
                self.open_readonly()
            case "rw":
                self.open_read_write()
            case _:
                logging.error("Connection type must be either 'rw' or 'ro'")
                raise ValueError("Connection type must be either 'rw' or 'ro'")
    
    def __enter__(self) -> libvirt.virConnect:
        if self.connection is not None:
            return self.connection
        else:
            logging.error("Failed to create libvirt socket connection.")
            raise RaisedException(f"Failed to create libvirt socket connection.")

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            self.connection.close();
    
    def open_readonly(self):
        try:
            self.connection = libvirt.openReadOnly(self.hypervisor_uri)
        except libvirt.libvirtError as e:
            logging.error(repr(e))
            raise RaisedException(f"Failed to open readonly libvirt connection to {self.hypervisor_uri}")
        except Exception as e:
            logging.error(repr(e))
            raise RaisedException(f"Failed to open readonly libvirt connection to {self.hypervisor_uri}")

    def open_read_write(self):
        try:
            self.connection = libvirt.open(self.hypervisor_uri)
        except libvirt.libvirtError as e:
            logging.error(repr(e))
            raise RaisedException(f"Failed to open read-write libvirt connection to {self.hypervisor_uri}")
        except Exception as e:
            logging.error(repr(e))
            raise RaisedException(f"Failed to open read-write libvirt connection to {self.hypervisor_uri}")