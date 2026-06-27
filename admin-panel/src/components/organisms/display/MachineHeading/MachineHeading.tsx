import { Group, Title } from "@mantine/core";
import React from "react";
import MachineControls from "../../../atoms/interactive/MachineControls/MachineControls";
import classes from "./MachineHeading.module.css";
import MachineActivityIndicator from "../../../atoms/feedback/MachineActivityIndicator/MachineActivityIndicator";
import { Machine } from "../../../../types/api.types";

export interface MachineHeadingProps {
    machine: Machine;
}

const MachineHeading = ({ machine }: MachineHeadingProps): React.JSX.Element => {
    return (
        <Group className={classes.container}>
            <Group className={classes.leftGroup}>
                <MachineActivityIndicator state={machine.state} />
                <Title
                    order={2}
                    className={classes.title}
                >
                    {machine?.title ?? "Unnamed Machine"}
                </Title>
            </Group>

            <MachineControls machine={machine} />
        </Group>
    );
};

export default MachineHeading;
