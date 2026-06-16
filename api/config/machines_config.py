from dataclasses import dataclass

from pydantic import BaseModel

@dataclass(frozen=True)
class MachinesConfig:
    vm_state_poll_interval = 2 #in seconds
    vm_state_wait_timeout = 30 #in seconds

MACHINES_CONFIG = MachinesConfig()