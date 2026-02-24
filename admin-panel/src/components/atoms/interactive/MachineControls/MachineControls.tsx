import { ActionIcon, Group, MantineSize } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import React from "react";
import { MachineState, UserExtended } from "../../../../types/api.types";
import useApi from "../../../../hooks/useApi";
import useFetch from "../../../../hooks/useFetch";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { isNull } from "lodash";
import { MantineActionIconAllProps } from "../../../../types/mantine.types";
import { useThrottledCallback } from "@mantine/hooks";

export interface MachineControlsProps {
    machine: {
        uuid: string;
        state: MachineState;
    };
    disabled?: boolean;
    size?: MantineSize | number | string;
    gap?: MantineSize | number | string;
    buttonProps?: MantineActionIconAllProps;
}

const MachineControls = ({ machine, size = "lg", gap = "sm", buttonProps, disabled = false }: MachineControlsProps): React.JSX.Element => {
    const { sendRequest } = useApi();
    const { data: user, loading, error } = useFetch<UserExtended>("/users/me");
    const { canManageMachine } = usePermissions();

    const startMachine = useThrottledCallback(() => {
        sendRequest("POST", `/machines/start/${machine.uuid}`);
    }, 2000);

    const stopMachine = useThrottledCallback(() => {
        sendRequest("POST", `/machines/stop/${machine.uuid}`);
    }, 2000);

    const disable =
        disabled || isNull(machine) || loading || !isNull(error) || !canManageMachine(user, machine) || !["ACTIVE", "OFFLINE", "ERROR"].includes(machine.state);

    return (
        <Group
            gap={gap}
            wrap="nowrap"
            onClick={(e) => e.preventDefault()}
        >
            <ActionIcon
                variant="light"
                size={size}
                color="suse-green.9"
                {...buttonProps}
                disabled={disable || machine.state === "ACTIVE"}
                onClick={startMachine}
            >
                <IconPlayerPlayFilled size={"28"} />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size={size}
                color="red.9"
                {...buttonProps}
                disabled={disable || ["OFFLINE", "ERROR"].includes(machine.state)}
                onClick={stopMachine}
            >
                <IconPlayerStopFilled size={"28"} />
            </ActionIcon>
        </Group>
    );
};

export default MachineControls;
