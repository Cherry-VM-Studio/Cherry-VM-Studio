import { Text } from "@mantine/core";
import React from "react";
import { formatDate } from "../../../utils/dates.ts";
import { CellContext } from "@tanstack/react-table";

const DateCell = ({ getValue }: CellContext<unknown, Date | null>): React.JSX.Element => {
    const value = getValue();
    return <Text>{value ? formatDate(value) : "-"}</Text>;
};

export default DateCell;
