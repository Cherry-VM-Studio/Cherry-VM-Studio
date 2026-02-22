import { NumberFormatterFactory } from "@mantine/core";
import { AccountType } from "./config.types";

export interface TokenRequestForm {
    username: string;
    password: string;
}

export interface Tokens {
    access_token: string;
    refresh_token: string;
}

export type MachineStates = "online" | "offline" | "loading" | "fetching";

export type ConnectionStatuses = "CONNECTING" | "OPEN" | "CLOSING" | "CLOSED" | "UNINSTANTIATED";

export type WebSocketResponseMethods = "ACKNOWLEDGE" | "REJECT" | "DATA";

export interface WebSocketCommand {
    method: string;
    access_token?: string;
    uuid: string | null;
    target?: string;
}

export interface WebSocketResponse {
    method: WebSocketResponseMethods;
    uuid: string;
    command?: WebSocketCommand;
    body?: object;
}

export interface ErrorResponseBody {
    detail?: string;
    [x: string]: any;
}

// users related

export interface Administrator {
    uuid: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    creation_date: string;
    last_active: string;
    disabled: boolean;
    account_type: "administrative";
    roles: string[];
    permissions: number;
}

export interface Client {
    uuid: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    creation_date: string;
    last_active: string;
    disabled: boolean;
    account_type: "client";
    groups: string[];
}

export interface Group {
    uuid: string;
    name: string;
    users: string[];
}

export interface Role {
    uuid: string;
    name: string;
    permissions: number;
    users: string[];
}

export interface AdministratorExtended extends Omit<Administrator, "roles"> {
    roles: Record<string, Role>;
}

export interface ClientExtended extends Omit<Client, "groups"> {
    groups: Record<string, Group>;
}

export interface GroupExtended extends Omit<Group, "users"> {
    users: Record<string, Client>;
}

export interface RoleExtended extends Omit<Role, "users"> {
    users: Record<string, Role>;
}

export type User = Administrator | Client;

export type UserExtended = AdministratorExtended | ClientExtended;

// machines

export type MachineDiskTypes = "raw" | "qcow2" | "qed" | "qcow" | "luks" | "vdi" | "vmdk" | "vpc" | "vhdx";

export interface MachineDisk {
    name: string;
    size_bytes: number;
    type: MachineDiskTypes;
}

export interface MachineDiskStaticData extends MachineDisk {
    system: boolean;
}

export interface MachineDiskDynamicData extends MachineDiskStaticData {
    occupied_bytes: number;
}

export interface MachineDiskForm {
    name: string;
    size: number;
    unit: "MiB" | "GiB";
    type: MachineDiskTypes;
}

export type MachineConnectionProtocols = "vnc" | "ssh" | "rdp";

export interface MachinePropertiesPayload {
    uuid: string;
    title?: string | null;
    tags?: string[] | null;
    description?: string | null;
    owner?: Administrator | null;
    assigned_clients: Record<string, Client>;
    ras_ip?: string | null;
    ras_port?: number | null;
    connections?: {
        ssh?: string;
        rdp?: string;
        vnc?: string;
    } | null;
    disks?: MachineDiskStaticData[] | null;
}

export interface MachineStatePayload {
    uuid: string;
    active: boolean;
    loading: boolean;
    vcpu: number;
    ram_max?: number | null;
    ram_used?: number | null;
    boot_timestamp?: string | null;
}

export interface MachineDisksPayload {
    uuid: string;
    disks?: MachineDiskDynamicData[] | null;
}

export interface MachineConnectionsPayload {
    uuid: string;
    active_connections?: string[] | null;
}

export type MachineState = "ACTIVE" | "LOADING" | "BOOTING_UP" | "ERROR" | "SHUTTING_DOWN" | "OFFLINE" | "FETCHING";

export interface Machine
    extends Omit<MachinePropertiesPayload, "disks">, Omit<MachineStatePayload, "active" | "loading">, MachineDisksPayload, MachineConnectionsPayload {
    state: MachineState;
}

export type WebSocketMessageTypes =
    | "CREATE"
    | "DELETE"
    | "BOOTUP_START"
    | "BOOTUP_SUCCESS"
    | "BOOTUP_FAIL"
    | "SHUTDOWN_START"
    | "SHUTDOWN_SUCCESS"
    | "SHUTDOWN_FAIL"
    | "DATA_STATIC"
    | "DATA_DYNAMIC"
    | "DATA_DYNAMIC_DISKS"
    | "DATA_DYNAMIC_CONNECTIONS";

type MachineWebSocketBodyMap = {
    CREATE: Record<string, MachinePropertiesPayload>;
    DELETE: { uuid: string };
    DATA_STATIC: Record<string, MachinePropertiesPayload>;
    DATA_DYNAMIC: Record<string, MachineStatePayload>;
    DATA_DYNAMIC_DISKS: Record<string, MachineDisksPayload>;
    DATA_DYNAMIC_CONNECTIONS: Record<string, MachineConnectionsPayload>;
    BOOTUP_START: { uuid: string };
    BOOTUP_SUCCESS: { uuid: string };
    BOOTUP_FAIL: { uuid: string; error: string | null };
    SHUTDOWN_START: { uuid: string };
    SHUTDOWN_SUCCESS: { uuid: string };
    SHUTDOWN_FAIL: { uuid: string; error: string | null };
};

export type MachineWebSocketMessage<T extends keyof MachineWebSocketBodyMap = keyof MachineWebSocketBodyMap> = {
    uuid: string;
    timestamp: string; // ISO 8601 Z
    type: T;
    body: MachineWebSocketBodyMap[T];
};

export interface CreateMachineBody {
    title: string;
    description: string;
    tags: string[];
    assigned_clients: string[];
    source_type: "iso" | "snapshot";
    source_uuid: string;
    config: {
        ram: number;
        vcpu: number;
    };
    disks: MachineDisk[];
    os_disk: number;
}

// libraries

export interface IsoFile {
    uuid: string;
    name: string;
    remote: boolean | null;
    file_location: string | null;
    file_size_bytes: number;
    last_used: string | null;
    imported_at: string | null;
    imported_by: User | null;
    last_modified_at: string | null;
    last_modified_by: User | null;
}

export interface MachineSnapshot {
    [x: string]: any;
}

export interface MachineTemplate {
    name: string;
    ram: number;
    vcpu: number;
    owner: Administrator;
    created_at: string;
}
