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

export const generateNodeObject = <T extends keyof NodeDataMap>(type: T, data: NodeDataMap[T], position: Position) => {
    const creators = {
        machine: generateMachineNodeObject,
        intnet: generateIntnetNodeObject,
        cloud: (_, pos) => generateCloudNodeObject(pos),
    } as {
        [K in keyof NodeDataMap]: (data: NodeDataMap[K], position: Position) => any;
    };

    return creators[type](data, position);
};

export const generateMachineNodeObject = (machine: NodeDataMap["machine"], position: Position) =>
    ({
        id: getNodeId("machine", machine.uuid),
        type: "machine",
        position: position,
        deletable: false,
        selectable: true,
        data: {
            label: machine.title,
            icon: IconDeviceDesktop,
        },
    }) as MachineNode;

export const generateIntnetNodeObject = (intnet: NodeDataMap["intnet"], position: Position) =>
    ({
        id: getNodeId("intnet", intnet.uuid),
        type: "intnet",
        position: position,
        deletable: false,
        selectable: true,
        data: {
            uuid: intnet.uuid,
            label: intnet.intnet_name,
            bridgeIp: intnet.bridge_ip,
            mac: "bridge_mac" in intnet ? intnet.bridge_mac : undefined,
        },
    }) as IntnetNode;

export const generateCloudNodeObject = (position: Position) =>
    ({
        id: CLOUD_ID,
        type: "cloud",
        position: position,
        deletable: false,
        selectable: true,
        data: {
            label: "Internet Gateway",
        },
    }) as CloudNode;
