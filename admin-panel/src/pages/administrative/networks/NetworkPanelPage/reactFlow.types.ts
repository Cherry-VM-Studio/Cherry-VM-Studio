import { Machine } from "../../../../types/api.types";
import type { Node } from "@xyflow/react";

export interface Position {
    x: number;
    y: number;
}

export interface Intnet {
    uuid: string;
    number: number;
    machines: string[];
}

export interface Flow {
    // nodes: (MachineNode | IntnetNode)[];
}

export type Intnets = Record<string, Intnet>;

export type NodeType = "machine" | "intnet" | "cloud";

export type NodeDataMap = {
    machine: Machine;
    intnet: Intnet;
    cloud: undefined;
};

export interface MachineNodeObject extends Node {
    type: "machine";
}

export interface IntnetNodeObject extends Node {
    type: "intnet";
    number: number;
    intnet: string; // uuid
}

export interface CloudNodeObject extends Node {
    type: "cloud";
}
