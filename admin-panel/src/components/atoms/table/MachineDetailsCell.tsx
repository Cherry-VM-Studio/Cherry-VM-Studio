import { Group, Stack, Text } from "@mantine/core";
import React from "react";
import MachineActivityIndicator from "../feedback/MachineActivityIndicator/MachineActivityIndicator";
import BadgeGroup from "../display/BadgeGroup/BadgeGroup";

const MachineDetailsCell = ({ getValue }): React.JSX.Element => {
    const { state, name, tags } = getValue();

    return (
        <Group
            gap="lg"
            align="start"
            c="white"
            wrap="nowrap"
        >
            <MachineActivityIndicator
                state={state}
                pt="xs"
            />
            <Stack gap="2">
                <Text
                    tt="capitalize"
                    size="lg"
                    style={{ textWrap: "nowrap" }}
                >
                    {name ?? "Unnamed Machine"}
                </Text>
                <BadgeGroup
                    size="sm"
                    items={tags ?? []}
                />
            </Stack>
        </Group>
    );
};

export default MachineDetailsCell;
