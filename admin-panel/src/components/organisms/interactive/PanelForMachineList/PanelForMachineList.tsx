import { Group, Paper } from "@mantine/core";
import { IconDeviceDesktopPlus, IconDevicesPlus, IconRefresh, IconStack2Filled } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./PanelForMachineList.module.css";
import PanelButtonGroup from "../../../molecules/interactive/PanelButtonGroup/PanelButtonGroup";
import MediumPanelButton from "../../../atoms/interactive/MediumPanelButton/MediumPanelButton";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import PopoverRadioGroup from "../../../molecules/interactive/PopoverRadioGroup/PopoverRadioGroup";

/**
 * Header panel for the Machine List page, providing controls for creating and managing virtual machines,
 * as well as options for modifying the grouping criteria of the machine list.
 */

const PanelForMachineList = ({ groupBy, setGroupBy, refreshNetworkData }) => {
    const [groupButtonOpened, setGroupButtonOpened] = useState(false);
    const { t, tns } = useNamespaceTranslation("pages");

    return (
        <Paper
            bg="dark.6"
            radius={0}
        >
            <Group className={classes.buttonGroup}>
                <PanelButtonGroup>
                    <MediumPanelButton
                        Icon={IconDeviceDesktopPlus}
                        label={tns("machine-list.panel.create")}
                    />
                    <MediumPanelButton
                        Icon={IconDevicesPlus}
                        label={tns("machine-list.panel.create-multiple")}
                    />
                    <MediumPanelButton
                        Icon={IconRefresh}
                        label={tns("machine-list.panel.refresh")}
                    />
                </PanelButtonGroup>
                <PopoverRadioGroup
                    opened={groupButtonOpened}
                    value={groupBy}
                    onValueChange={setGroupBy}
                    classNames={{ popoverDropdown: classes.groupByDropdown, radioLabel: classes.radioLabel }}
                    options={[
                        { value: "group", label: t("type") },
                        { value: "state", label: t("state") },
                        { value: "membership", label: t("membership") },
                    ]}
                >
                    <MediumPanelButton
                        onClick={() => setGroupButtonOpened((prev) => !prev)}
                        Icon={IconStack2Filled}
                        label={tns("machine-list.panel.group-by")}
                        radius={groupButtonOpened && "var(--mantine-radius-md) var(--mantine-radius-md) 0 0"}
                    />
                </PopoverRadioGroup>
            </Group>
        </Paper>
    );
};

export default PanelForMachineList;
