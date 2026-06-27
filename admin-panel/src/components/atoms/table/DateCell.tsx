import { Text } from "@mantine/core";
import React from "react";
import { formatDate } from "../../../utils/dates.ts";

const DateCell = ({ getValue }: { getValue: () => Date | null }): React.JSX.Element => {
    const value = getValue();
    return <Text>{value ? formatDate(value) : "-"}</Text>;
};

export default DateCell;
