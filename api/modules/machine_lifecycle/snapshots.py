from __future__ import annotations

import logging

from typing import Union

from modules.machine_lifecycle.models import MachineParameters

logger = logging.getLogger(__name__)

def create_machine_snapshot(machine: Union[str, MachineParameters]) -> None:
    pass