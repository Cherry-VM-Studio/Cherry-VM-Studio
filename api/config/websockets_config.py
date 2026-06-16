from dataclasses import dataclass

@dataclass(frozen=True)
class WebsocketsConfig:
    state_broadcast_interval = 1
    disks_broadcast_interval = 120
    connections_broadcast_interval = 10

WEBSOCKETS_CONFIG = WebsocketsConfig()