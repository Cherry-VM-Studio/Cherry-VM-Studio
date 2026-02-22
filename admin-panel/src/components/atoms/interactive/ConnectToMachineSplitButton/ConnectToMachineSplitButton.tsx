import { IconDeviceDesktop } from "@tabler/icons-react";
import SplitButton, { SplitButtonProps } from "../SplitButton/SplitButton";
import classes from "./ConnectToMachineSplitButton.module.css";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { Machine, MachineConnectionProtocols, UserExtended } from "../../../../types/api.types";
import useFetch from "../../../../hooks/useFetch";
import { keys, merge } from "lodash";

export interface ConnectToMachineSplitButtonProps extends SplitButtonProps {
    machine: Machine;
}

const ConnectToMachineSplitButton = ({ machine, ...props }: ConnectToMachineSplitButtonProps): React.JSX.Element => {
    const { t } = useTranslation();
    const { data: user } = useFetch<UserExtended>("/users/me");
    const { canConnectToMachine } = usePermissions();

    const canConnect = canConnectToMachine(user, machine) && machine.state === "ACTIVE";

    const connectionKeys = keys(machine.connections).sort((a, b) => (a === "ssh" ? 1 : b === "ssh" ? -1 : 0)) as MachineConnectionProtocols[];
    const mainKey = connectionKeys.shift() as MachineConnectionProtocols;

    const openSession = (key: MachineConnectionProtocols) => window.open(machine.connections[key], "_blank", "noopener,noreferrer");

    return (
        <SplitButton
            onClick={() => openSession(mainKey)}
            variant="light"
            color="gray"
            disabled={!canConnect || !mainKey}
            className={classes.connectButton}
            leftSection={<IconDeviceDesktop size={18} />}
            {...props}
            sideButtonProps={merge(
                {
                    className: classes.connectButton,
                    disabled: !canConnect || !connectionKeys.length,
                    variant: "light",
                    color: "gray",
                },
                props?.sideButtonProps,
            )}
            menuProps={merge(
                {
                    classNames: { dropdown: classes.connectButtonMenu },
                    offset: 0,
                },
                props?.menuProps,
            )}
            menuButtonsProps={connectionKeys.map((key) => ({
                children: t(`connect-via-${key}`),
                onClick: () => openSession(key),
                leftSection: <IconDeviceDesktop size={18} />,
                justify: "left",
                className: classes.menuButton,
                variant: "light",
                color: "gray",
            }))}
        >
            {t(mainKey ? `connect-via-${mainKey}` : "connect")}
        </SplitButton>
    );
};

export default ConnectToMachineSplitButton;
