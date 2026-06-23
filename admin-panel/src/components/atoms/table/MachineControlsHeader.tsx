import { useThrottledCallback } from "@mantine/hooks";
import useApi from "../../../hooks/useApi";
import { ActionIcon, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import { HeaderContext } from "@tanstack/react-table";
import { MachineState } from "../../../types/api.types";

export interface MachineControlsHeaderProps extends HeaderContext<unknown, unknown> {
    disabled: boolean;
}

const MachineControlsHeader = ({ table, disabled }: MachineControlsHeaderProps): React.JSX.Element => {
    const { sendRequest } = useApi();

    const getSelectedMachines = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        return selectedRows.map((row) => row.getValue("options") as { state: MachineState; uuid: string }) ?? [];
    };

    const startMachine = useThrottledCallback(() => {
        getSelectedMachines().forEach(({ state, uuid }) => {
            if (state === "OFFLINE" || state === "ERROR") {
                sendRequest("POST", `/machines/start/${uuid}`);
            }
        });
    }, 1000);

    const stopMachine = useThrottledCallback(() => {
        getSelectedMachines().forEach(({ state, uuid }) => {
            if (state === "ACTIVE") {
                sendRequest("POST", `/machines/stop/${uuid}`);
            }
        });
    }, 1000);

    if ((!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) || disabled) return <></>;

    return (
        <Group
            gap="xs"
            justify="end"
            flex="1"
            onClick={(e) => e.preventDefault()}
        >
            <ActionIcon
                variant="light"
                size="36"
                color="gray"
                onClick={startMachine}
            >
                <IconPlayerPlayFilled
                    size={22}
                    color="var(--mantine-color-suse-green-5)"
                />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="36"
                color="gray"
                onClick={stopMachine}
            >
                <IconPlayerStopFilled
                    size={22}
                    color="var(--mantine-color-cherry-5)"
                />
            </ActionIcon>
        </Group>
    );
};

export default MachineControlsHeader;
