import { ActionIcon, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled, IconTrashXFilled } from "@tabler/icons-react";
import React, { MouseEvent } from "react";
import useApi from "../../../hooks/useApi";
import classes from "./MachineControlsCell.module.css";
import { useThrottledCallback } from "@mantine/hooks";
import ModalButton from "../interactive/ModalButton/ModalButton";
import DeleteModal from "../../../modals/base/DeleteModal/DeleteModal";
import { MachineState } from "../../../types/api.types";

export interface MachineControlsCellProps {
    uuid: string;
    state: MachineState;
    disabled: boolean;
}

const MachineControlsCell = ({ uuid, state, disabled = false }: MachineControlsCellProps): React.JSX.Element => {
    const { sendRequest } = useApi();

    const toggleState = useThrottledCallback((e) => {
        e.preventDefault();

        if (state === "ACTIVE") sendRequest("POST", `/machines/stop/${uuid}`);
        else if (state === "OFFLINE" || state === "ERROR") sendRequest("POST", `/machines/start/${uuid}`);
    }, 2000);

    return (
        <Group
            gap="xs"
            justify="end"
            flex="1"
            onClick={(e) => e.preventDefault()}
        >
            {/* <Button
                variant="light"
                color="cherry"
                size="xs"
                onClick={(e) => e.preventDefault()}
                disabled={disabled || state.fetching || state?.loading || !state?.active}
                className={classes.button}
            >
                {t("connect")}
            </Button> */}

            <ActionIcon
                variant="light"
                size="36"
                color={state === "ACTIVE" ? "red.9" : "suse-green.6"}
                disabled={disabled || !["ACTIVE", "OFFLINE", "ERROR"].includes(state)}
                onClick={toggleState}
            >
                {state === "ACTIVE" ? <IconPlayerStopFilled size={22} /> : <IconPlayerPlayFilled size={22} />}
            </ActionIcon>
            <ModalButton
                ButtonComponent={ActionIcon}
                buttonProps={{
                    variant: "light",
                    size: "36",
                    color: "red.9",
                    disabled: disabled || state !== "OFFLINE",
                    className: classes.button,
                }}
                ModalComponent={DeleteModal}
                modalProps={{
                    path: "/machines/delete",
                    uuids: [uuid],
                    i18nextPrefix: "confirm.machine-removal",
                }}
            >
                <IconTrashXFilled size={"24"} />
            </ModalButton>
        </Group>
    );
};

export default MachineControlsCell;
