import { values } from "lodash";
import { Machine } from "../../../../types/api.types";

export const parseData = (machines: Record<string, Machine>) =>
    values(machines).map((machine) => {
        return {
            uuid: machine.uuid,
            details: { name: machine.title, state: machine.state, tags: machine.tags },
            state: { state: machine.state, bootTimestamp: machine.boot_timestamp },
            ram: Math.round((machine.ram_used / machine.ram_max) * 100),
            owner: [machine.owner],
            clients: values(machine.assigned_clients),
            options: { state: machine.state, uuid: machine.uuid },
        };
    });
