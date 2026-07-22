import { IconDeviceDesktop } from "@tabler/icons-react";
import { CloudNode, IntnetNode, MachineNode, NodeDataMap, NodeType, Position } from "./reactFlow.types";
import _ from "lodash";
import { Node } from "@xyflow/react";

export const NODE_ID_SEPERATOR = ":::";
export const CLOUD_ID = "cloud:::";

export const getNodeId = (type: NodeType, resourceUuid: string) => `${type}${NODE_ID_SEPERATOR}${resourceUuid}`;

export const getResourceUuidFromNode = (nodeId: string): string | null => nodeId.split(NODE_ID_SEPERATOR)[1] || null;

export const getResourceTypeFromNode = (nodeId: string): string | null => nodeId.split(NODE_ID_SEPERATOR)[0] || null;

export const calcMiddlePosition = (...positions: Position[]) => {
    if (positions.length === 0) return null;

    const sum = positions.flat().reduce(
        (acc, coords) => ({
            x: acc.x + (coords?.x ?? 0),
            y: acc.y + (coords?.y ?? 0),
        }),
        { x: 0, y: 0 },
    );

    return {
        x: sum.x / positions.length,
        y: sum.y / positions.length,
    };
};

export const extractPositionsFromNodes = (nodes: Node[]) => nodes?.reduce((acc, { id, position }) => ({ ...acc, [id]: position }), {}) ?? {};

export const generateNodeObject = <T extends keyof NodeDataMap>(type: T, data: NodeDataMap[T], position: Position, selected?: boolean) => {
    const creators = {
        machine: generateMachineNodeObject,
        intnet: generateIntnetNodeObject,
        cloud: (_, pos, selected) => generateCloudNodeObject(pos, selected),
    } as {
        [K in keyof NodeDataMap]: (data: NodeDataMap[K], position: Position, selected?: boolean) => any;
    };

    return creators[type](data, position, selected);
};

export const generateMachineNodeObject = (machine: NodeDataMap["machine"], position: Position, selected?: boolean) =>
    ({
        id: getNodeId("machine", machine.uuid),
        type: "machine",
        position: position,
        deletable: false,
        selectable: true,
        selected,
        data: {
            uuid: machine.uuid,
            label: machine.title,
            icon: IconDeviceDesktop,
        },
    }) as MachineNode;

export const generateIntnetNodeObject = (intnet: NodeDataMap["intnet"], position: Position, selected?: boolean) =>
    ({
        id: getNodeId("intnet", intnet.uuid),
        type: "intnet",
        position: position,
        deletable: false,
        selectable: true,
        selected,
        data: {
            uuid: intnet.uuid,
            label: intnet.intnet_name,
            bridgeIp: intnet.bridge_ip,
            mac: "bridge_mac" in intnet ? intnet.bridge_mac : undefined,
        },
    }) as IntnetNode;

export const generateCloudNodeObject = (position: Position, selected?: boolean) =>
    ({
        id: CLOUD_ID,
        type: "cloud",
        position: position,
        deletable: false,
        selectable: true,
        selected,
        data: {
            label: "Internet Gateway",
        },
    }) as CloudNode;
