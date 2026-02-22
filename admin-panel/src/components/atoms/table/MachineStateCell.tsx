import { Group, Loader, Text } from "@mantine/core";
import React from "react";
import { timeSince } from "../../../utils/dates";
import { useTranslation } from "react-i18next";

const MachineStateCell = ({ getValue }): React.JSX.Element => {
    const { state, bootTimestamp } = getValue();
    const { t } = useTranslation();

    if (!["ACTIVE", "OFFLINE", "ERROR"].includes(state)) {
        return (
            <Group gap="xs">
                <Text
                    c="dimmed"
                    size="md"
                >
                    {t(state.toLowerCase().replace("_", "-"))}
                </Text>
                <Loader
                    type="dots"
                    size="sm"
                    color="dimmed"
                />
            </Group>
        );
    }

    return (
        <Text
            c="dimmed"
            size="md"
        >
            {state === "ACTIVE"
                ? bootTimestamp
                    ? `${t("running-for")} ${timeSince(new Date(`${bootTimestamp}Z`))}`
                    : t("active")
                : t(state.toLowerCase().replace("_", "-"))}
        </Text>
    );
};

export const sortingFunction = (rowA: any, rowB: any, columnId: string) => {
    const stateA = rowA.getValue(columnId);
    const stateB = rowB.getValue(columnId);

    return stateA?.state?.localeCompare(stateB?.state) ?? 1;
};

export default MachineStateCell;
