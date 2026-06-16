import { Portal } from "@mantine/core";
import CreateMachineModal from "../../../../modals/machines/CreateMachineModal/CreateMachineModal";
import SplitButton, { SplitButtonProps } from "../../../atoms/interactive/SplitButton/SplitButton";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { IconDeviceDesktopPlus, IconDevices2 } from "@tabler/icons-react";
import { useState } from "react";
import CreateMachinesInBulkModal from "../../../../modals/machines/CreateMachinesInBulkModal/CreateMachinesInBulkModal";
import classes from "./CreateMachineSplitButton.module.css";

export interface CreateMachineSplitButtonProps extends SplitButtonProps {
    onSubmit: () => void;
}

const CreateMachineSplitButton = ({ children, disabled, onSubmit, ...props }: CreateMachineSplitButtonProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("pages", "machines.controls.");
    const [modalOpened, setModalOpened] = useState(false);
    const [bulkModalOpened, setBulkModalOpened] = useState(false);

    return (
        <>
            <SplitButton
                onClick={() => setModalOpened(true)}
                className={classes.createButton}
                leftSection={
                    <IconDeviceDesktopPlus
                        size={16}
                        stroke={2}
                    />
                }
                {...props}
                disabled={disabled}
                menuProps={{ classNames: { dropdown: classes.createMenuDropdown }, offset: 0 }}
                sideButtonProps={{ disabled, className: classes.sideButton }}
                menuButtonsProps={[
                    {
                        leftSection: (
                            <IconDevices2
                                size={16}
                                stroke={2}
                            />
                        ),
                        children: <>{tns("create-multiple")} </>,
                        className: classes.menuButton,
                        styles: { label: { flex: 1 } },
                        justify: "start",
                        onClick: () => setBulkModalOpened(true),
                    },
                ]}
            >
                {children}
            </SplitButton>
            <Portal>
                <CreateMachineModal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    onSubmit={onSubmit}
                />
                <CreateMachinesInBulkModal
                    opened={bulkModalOpened}
                    onClose={() => setBulkModalOpened(false)}
                    onSubmit={onSubmit}
                />
            </Portal>
        </>
    );
};

export default CreateMachineSplitButton;
