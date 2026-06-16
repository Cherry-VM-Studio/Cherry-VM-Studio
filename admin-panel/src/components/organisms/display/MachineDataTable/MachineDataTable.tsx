import { Box, Group, Loader, ScrollArea, Stack, TextInput } from "@mantine/core";
import BadgeGroup from "../../../atoms/display/BadgeGroup/BadgeGroup";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { Machine, MachineState } from "../../../../types/api.types";
import React from "react";
import { chunk } from "lodash";
import { IconCircleFilled } from "@tabler/icons-react";
import ConnectToMachineSplitButton from "../../../atoms/interactive/ConnectToMachineSplitButton/ConnectToMachineSplitButton";

export interface MachineDataTableProps {
    machine: Machine;
}

const MachineDataTable = ({ machine }: MachineDataTableProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "machine");

    const colorMap: Record<MachineState, string> = {
        FETCHING: "orange-6",
        LOADING: "yellow-5",
        BOOTING_UP: "yellow-5",
        SHUTTING_DOWN: "yellow-5",
        ACTIVE: "suse-green-5",
        OFFLINE: "cherry-5",
        ERROR: "cherry-11",
    };

    const stateColor = `var(--mantine-color-${colorMap[machine.state || "FETCHING"]})`;
    const chunkedActiveConnections = chunk(machine.active_connections?.length ? machine.active_connections : [null, null], 2);

    return (
        <Stack
            mih="0"
            flex="1"
        >
            <ScrollArea>
                <Stack p="md">
                    <BadgeGroup
                        items={machine?.tags || []}
                        label={undefined}
                    />
                    <Group>
                        <TextInput
                            description={tns("state")}
                            classNames={{
                                input: "borderless",
                            }}
                            leftSectionWidth={40}
                            readOnly
                            flex="1"
                            styles={{
                                input: {
                                    color: stateColor,
                                },
                            }}
                            leftSection={
                                !["OFFLINE", "ERROR", "ACTIVE"].includes(machine.state) ? (
                                    <Loader
                                        type="bars"
                                        size="12"
                                        color={stateColor}
                                    />
                                ) : (
                                    <IconCircleFilled
                                        size={8}
                                        color={stateColor}
                                    />
                                )
                            }
                            value={t(machine.state.toLowerCase().replace("_", "-"))}
                        />
                        <TextInput
                            description={tns("machine-port")}
                            classNames={{ input: "borderless" }}
                            flex="1"
                            readOnly
                            value={machine.state === "ACTIVE" && machine.ras_port ? `${machine.ras_port}` : "-"}
                        />
                    </Group>

                    {chunkedActiveConnections.map((chunk, i) => (
                        <Group
                            key={i}
                            align="end"
                        >
                            <TextInput
                                description={i === 0 ? tns("active-connections") : ""}
                                classNames={{ input: "borderless" }}
                                readOnly
                                value={chunk[0] ?? "-"}
                                flex="1"
                            />
                            <TextInput
                                classNames={{ input: "borderless" }}
                                readOnly
                                value={chunk[1] ?? "-"}
                                flex="1"
                            />
                        </Group>
                    ))}
                </Stack>
            </ScrollArea>
            <Box m="auto auto">
                <ConnectToMachineSplitButton machine={machine} />
            </Box>
        </Stack>
    );
};

export default MachineDataTable;
