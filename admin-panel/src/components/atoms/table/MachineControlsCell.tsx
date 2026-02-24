import { ActionIcon, Group, Loader } from "@mantine/core";
import { IconEye, IconPlayerPlayFilled, IconPlayerStopFilled, IconTrashXFilled } from "@tabler/icons-react";
import React, { MouseEvent, useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";
import classes from "./MachineControlsCell.module.css";
import { useThrottledCallback } from "@mantine/hooks";
import ModalButton from "../interactive/ModalButton/ModalButton";
import DeleteModal from "../../../modals/base/DeleteModal/DeleteModal";
import { MachineState } from "../../../types/api.types";
import { Link } from "react-router-dom";

export interface MachineControlsCellProps {
    uuid: string;
    state: MachineState;
    disabled: boolean;
}

const MachineControlsCell = ({ uuid, state, disabled = false }: MachineControlsCellProps): React.JSX.Element => {
    const { sendRequest } = useApi();
    const [used, setUsed] = useState(false);

    const toggleState = useThrottledCallback((e) => {
        e.preventDefault();

        if (state === "ACTIVE") sendRequest("POST", `/machines/stop/${uuid}`);
        else if (state === "OFFLINE" || state === "ERROR") sendRequest("POST", `/machines/start/${uuid}`);

        // 1.
        // to make the button disabled instantly
        // without having to wait on the BOOTUP_START/SHUTDOWN_START message
        setUsed(true);
        setTimeout(() => setUsed(false), 1000);
    }, 1000);

    // 2.
    // when we receive the state update we can rely on the disabled prop again
    useEffect(() => setUsed(false), [state]);

    const toggleDisabled = used || disabled || !["ACTIVE", "OFFLINE", "ERROR"].includes(state);

    return (
        <Group
            gap="xs"
            justify="end"
            flex="1"
            onClick={(e) => e.preventDefault()}
        >
            <ActionIcon
                variant="light"
                color="gray"
                size="36"
                disabled={toggleDisabled}
                onClick={toggleState}
            >
                {toggleDisabled ? (
                    <Loader
                        color="orange.6"
                        size={16}
                        type="bars"
                    />
                ) : state === "ACTIVE" ? (
                    <IconPlayerStopFilled
                        size={22}
                        color="var(--mantine-color-cherry-5)"
                    />
                ) : (
                    <IconPlayerPlayFilled
                        size={22}
                        color="var(--mantine-color-suse-green-5)"
                    />
                )}
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="36"
                color="gray"
                component={Link}
                to={`/admin/machines/machine/${uuid}`}
            >
                <IconEye />
            </ActionIcon>
        </Group>
    );
};

export default MachineControlsCell;
