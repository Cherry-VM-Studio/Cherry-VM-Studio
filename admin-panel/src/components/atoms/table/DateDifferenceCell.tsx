import { Text } from "@mantine/core";
import React from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { timePassedRounded } from "../../../utils/dates.ts";

const DateDifferenceCell = ({ getValue }: { getValue: () => string | null }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages");

    const val = getValue();
    const [count, unit] = timePassedRounded(new Date(`${val}Z`));

    if (!val) return <Text>-</Text>;
    return <Text>{tns(`accounts.table.cells.last-active.${unit}`, { count })}</Text>;
};

export default DateDifferenceCell;
