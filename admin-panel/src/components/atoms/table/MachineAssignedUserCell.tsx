import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";
import { Stack } from "@mantine/core";
import AvatarsCell from "./AvatarsCell";
import { getFullUserName } from "../../../utils/users";
import { User, UserExtended } from "../../../types/api.types";
import { CellContext } from "@tanstack/react-table";

const MachineAssignedUserCell = ({ getValue, ...props }: CellContext<unknown, User[] | UserExtended[]>): React.JSX.Element => {
    const users = getValue().filter((e) => e);

    if (!users?.length) return <></>;
    if (users.length === 1)
        return (
            <BusinessCard
                name={getFullUserName(users[0])}
                comment={`@${users[0].username}`}
                size="md"
            />
        );

    return (
        <AvatarsCell
            getValue={getValue}
            {...props}
        />
    );
};

export const sortingFunction = (rowA: any, rowB: any, columndId: string) => {
    const detailsA = rowA.getValue(columndId)?.[0];
    const detailsB = rowB.getValue(columndId)?.[0];

    if (!detailsA) return false;
    if (!detailsB) return true;

    return getFullUserName(detailsB).localeCompare(getFullUserName(detailsA));
};

export const filterFunction = (row: any, columnId: string, filterValue: string) => {
    const details = row.getValue(columnId)?.[0];
    return getFullUserName(details).toLowerCase().startsWith(filterValue.toLowerCase());
};

export default MachineAssignedUserCell;
