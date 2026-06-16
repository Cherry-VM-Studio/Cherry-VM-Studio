from dataclasses import dataclass

@dataclass(frozen=True)
class RegexConfig:
    universal_name: str = r"^[a-zA-Z][\w\s.-]{2,23}$" # can be used as a universal name validation
    username: str = r"^[a-z][a-z0-9_\.-]{2,23}$"
    password: str = r"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-]).{10,256}$"
    network_snapshot_name: str = r"^[!-z]{3,24}$"

REGEX_CONFIG = RegexConfig()