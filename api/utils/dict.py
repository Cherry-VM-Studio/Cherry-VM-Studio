from typing import Any, Hashable

def push_to_dict (dict: dict, key: Hashable, value: Any) -> None:
    if key not in dict:
        dict[key] = []
    dict[key].append(value)