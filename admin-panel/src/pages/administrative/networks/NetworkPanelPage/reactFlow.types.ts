import { IconDeviceDesktop } from "@tabler/icons-react";
import { InternalNetwork, InternalNetworkSetForm, Machine } from "../../../../types/api.types";
import type { Edge, Node } from "@xyflow/react";

export interface Position {
    x: number;
    y: number;
}

export interface Flow {
    // nodes: (MachineNode | IntnetNode)[];
}

export type Intnets = Record<string, InternalNetwork>;

export type NodeType = "machine" | "intnet" | "cloud";

export type NodeDataMap = {
    machine: Machine;
    intnet: InternalNetwork | InternalNetworkSetForm;
    cloud: undefined;
};

export type MachineNodeData = {
    icon: typeof IconDeviceDesktop;
    label: string;
};

export type IntnetNodeData = {
    uuid: string;
    label: string;
    mac?: string;
    bridgeIp: string | null;
};

export type MachineNode = Node<MachineNodeData, "machine">;

export type IntnetNode = Node<IntnetNodeData, "intnet">;

export type CloudNode = Node<never, "cloud">;

export type NetworkPanelNode = MachineNode | IntnetNode | CloudNode;

export type NetworkPanelEdgeData = {
    interfaceMac: string; // originating interface of the virtual machine
};

export type NetworkPanelEdge = Edge<NetworkPanelEdgeData>;
