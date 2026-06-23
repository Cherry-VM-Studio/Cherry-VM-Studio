import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";
import { useMediaQuery } from "@mantine/hooks";
import { getFullUserName } from "../../../utils/users";
import { CellContext } from "@tanstack/react-table";
import { UserExtended } from "../../../types/api.types";

const BusinessCardCell = ({ getValue }: CellContext<unknown, UserExtended>): React.JSX.Element => {
    const user = getValue() || {};

    return (
        <BusinessCard
            // imageSrc={user.avatar}
            comment={`@${user.username}`}
            name={getFullUserName(user)}
            withAvatar={useMediaQuery(`(min-width: 1200px)`)}
        />
    );
};

export const sortingFunction = (rowA: any, rowB: any, columnId: string) => {
    const detailsA = rowA.getValue(columnId);
    const detailsB = rowB.getValue(columnId);

    return getFullUserName(detailsB).localeCompare(getFullUserName(detailsA));
};

export const filterFunction = (row: any, columnId: string, filterValue: string) => {
    const details = row.getValue(columnId);
    return getFullUserName(details).toLowerCase().startsWith(filterValue.toLowerCase());
};

export default BusinessCardCell;
