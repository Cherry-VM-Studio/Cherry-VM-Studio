import { values } from "lodash";
import { Administrator, Client, Machine, MachineDiskDynamicData, MachineState } from "../../../../types/api.types";

export interface MachinesTableRow {
    uuid: string;
    details: {
        name: string;
        state: MachineState;
        tags: string[];
    };
    description: string;
    port: "-" | number;
    ram: number;
    vcpu: number;
    owner: Administrator[];
    clients: Client[];
    connected_users: string[] | null;
    disks: MachineDiskDynamicData[] | null;
    options: {
        state: MachineState;
        uuid: string;
    };
}

export const parseData = (machines: Record<string, Machine>) =>
    values(machines).map(
        (machine) =>
            ({
                uuid: machine.uuid,
                details: { name: machine.title, state: machine.state, tags: machine.tags },
                description: machine.description,
                port: machine.ras_port === -1 ? "-" : machine.ras_port,
                state: { state: machine.state, bootTimestamp: machine.boot_timestamp },
                ram: machine.ram_used && machine.ram_max ? Math.round((machine.ram_used / machine.ram_max) * 100) : 0,
                vcpu: machine.vcpu,
                owner: [machine.owner],
                clients: values(machine.assigned_clients),
                connected_users: machine.active_connections,
                disks: machine.disks,
                options: { state: machine.state, uuid: machine.uuid },
            }) as MachinesTableRow,
    );
