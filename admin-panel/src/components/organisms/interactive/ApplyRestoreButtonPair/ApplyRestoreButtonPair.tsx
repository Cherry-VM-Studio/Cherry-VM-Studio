import React from "react";
import ApplyButton from "../../../molecules/interactive/ApplyButton/ApplyButton";
import RestoreButton from "../../../molecules/interactive/RestoreButton/RestoreButton";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { ApplyRestoreButtonProps } from "../../../../types/components.types";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";

const ApplyRestoreButtonPair = ({ resetFlow, applyNetworkConfig, isDirty }: ApplyRestoreButtonProps): React.JSX.Element => {
    const { sendNotification } = useMantineNotifications();
    const { tns } = useNamespaceTranslation("modals");

    const onRestore = () => {
        resetFlow().then(() => sendNotification("network-panel.flow-restore"));
    };

    return (
        <>
            <RestoreButton
                onConfirm={onRestore}
                buttonProps={{
                    display: isDirty ? undefined : "none",
                    w: 100,
                }}
                modalProps={{
                    title: tns("confirm.np-restore.title"),
                    message: tns("confirm.np-restore.description"),
                }}
            />
            <ApplyButton
                onClick={applyNetworkConfig}
                isDirty={isDirty}
                disabled={!isDirty}
                w={isDirty ? 100 : 200}
            />
        </>
    );
};

export default ApplyRestoreButtonPair;
