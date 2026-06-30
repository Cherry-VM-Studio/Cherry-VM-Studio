import { Group, Stack, Text } from "@mantine/core";
import React from "react";
import MachineActivityIndicator from "../feedback/MachineActivityIndicator/MachineActivityIndicator";
import BadgeGroup from "../display/BadgeGroup/BadgeGroup";
import { MachineState } from "../../../types/api.types";
import { CellContext } from "@tanstack/react-table";
import _ from "lodash";

interface MachineDetails {
    uuid: string;
    state: MachineState;
    name: string;
    tags: string[];
}

const MachineDetailsCell = ({ getValue }: CellContext<unknown, MachineDetails>): React.JSX.Element => {
    const { state, name, tags } = getValue();

    return (
        <Group
            gap="lg"
            align="stretch"
            c="white"
            wrap="nowrap"
        >
            <MachineActivityIndicator
                state={state}
                pt="xs"
            />
            <Stack
                gap="2"
                justify="center"
                mih="0"
            >
                <Text
                    tt="capitalize"
                    size="lg"
                    style={{ textWrap: "nowrap" }}
                >
                    {name ?? "Unnamed Machine"}
                </Text>
                {!_.isEmpty(tags) ? (
                    <BadgeGroup
                        size="sm"
                        items={tags ?? []}
                    />
                ) : (
                    <></>
                )}
            </Stack>
        </Group>
    );
};

export default MachineDetailsCell;
