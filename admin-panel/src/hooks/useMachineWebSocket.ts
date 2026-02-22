import { useEffect, useState } from "react";
import useApiWebSocket from "./useApiWebSocket";
import { Machine, MachineState, MachineStatePayload, MachineWebSocketMessage } from "../types/api.types";
import { isNull, isUndefined, keys, mapValues, merge, pick } from "lodash";

export type MachineStateRetrievalModes = "subscribed" | "account" | "global";

export interface useMachineWebSocketReturn {
    machines: Record<string, Machine>;
}

/**
 * Description placeholder
 *
 * @param {MachineStateRetrievalModes} mode
 * @param {?string} [target] if mode === "subscribed"
 */
const useMachineWebSocket = (mode: MachineStateRetrievalModes, target?: string): useMachineWebSocketReturn => {
    const { lastJsonMessage } = useApiWebSocket(`/ws/machines/${mode}`, { machine_uuid: target });
    const [machines, setMachines] = useState<Record<string, Machine>>(null);

    const onNewMessage = (message: MachineWebSocketMessage | null) => {
        if (isNull(message)) return;

        console.log(message);
        if (message.type === "CREATE" || message.type === "DATA_STATIC") {
            return setMachines((prev) =>
                mapValues(
                    merge(prev ?? {}, (message as MachineWebSocketMessage<"DATA_STATIC" | "CREATE">).body),
                    (machine) =>
                        ({
                            state: "FETCHING",
                            boot_timestamp: null,
                            connections: [],
                            active_connections: [],
                            ...machine,
                        }) as Machine,
                ),
            );
        }

        if (message.type === "DELETE") {
            return setMachines((prev) => {
                const newMachines = { ...prev };
                delete newMachines[(message as MachineWebSocketMessage<"DELETE">).body.uuid];
                return newMachines;
            });
        }

        if (message.type === "DATA_DYNAMIC") {
            return setMachines((prev) => {
                const updateStateProperty = (oldState: MachineState, active: boolean, loading: boolean): MachineState => {
                    if (loading) return ["BOOTING_UP", "SHUTTING_DOWN"].includes(oldState) ? oldState : "LOADING";
                    return active ? "ACTIVE" : oldState === "ERROR" ? "ERROR" : "OFFLINE";
                };

                const merged = mapValues(prev, (machine, key) => {
                    if (isUndefined(message?.body?.[key])) {
                        return { ...machine, state: "FETCHING" } as Machine;
                    }

                    const { active, loading, ...machineStatePayload } = message.body[key] as MachineStatePayload;

                    return {
                        ...machine,
                        ...machineStatePayload,
                        state: updateStateProperty(machine.state, active, loading),
                    };
                });

                return merged;
            });
        }

        if (message.type === "DATA_DYNAMIC_DISKS" || message.type === "DATA_DYNAMIC_CONNECTIONS") {
            const filtered = pick(message.body, keys(machines));
            setMachines((prev) => merge(prev, filtered));
        }

        const STATE_MAP = {
            BOOTUP_START: "BOOTING_UP",
            BOOTUP_SUCCESS: "ACTIVE",
            BOOTUP_FAIL: "ERROR",
            SHUTDOWN_START: "SHUTTING_DOWN",
            SHUTDOWN_SUCCESS: "OFFLINE",
            SHUTDOWN_FAIL: "ERROR",
        } as const;

        function isStateUpdateMessage(
            message: MachineWebSocketMessage,
        ): message is
            | MachineWebSocketMessage<"BOOTUP_START">
            | MachineWebSocketMessage<"BOOTUP_SUCCESS">
            | MachineWebSocketMessage<"BOOTUP_FAIL">
            | MachineWebSocketMessage<"SHUTDOWN_START">
            | MachineWebSocketMessage<"SHUTDOWN_SUCCESS">
            | MachineWebSocketMessage<"SHUTDOWN_FAIL"> {
            return message.type in STATE_MAP;
        }

        if (isStateUpdateMessage(message)) {
            const machineUuid = message.body.uuid;
            const newState = STATE_MAP[message.type];

            setMachines((prev) => {
                if (!prev[machineUuid]) {
                    console.warn(`Machine ${machineUuid} not found for ${message.type} event`);
                    return prev;
                }

                const newMachines = { ...prev };
                newMachines[machineUuid] = { ...newMachines[machineUuid], state: newState };
                return newMachines;
            });
        }
    };

    useEffect(() => {
        onNewMessage(lastJsonMessage);
    }, [lastJsonMessage]);

    return {
        machines,
    };
};

export default useMachineWebSocket;
