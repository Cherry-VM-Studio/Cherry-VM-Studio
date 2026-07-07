import React from "react";
import BusinessCard from "../display/BusinessCard/BusinessCard";
import { useMediaQuery } from "@mantine/hooks";
import { getFullUserName } from "../../../utils/users";
import { CellContext } from "@tanstack/react-table";
import { UserExtended } from "../../../types/api.types";
import { MantineSize } from "@mantine/core";

export interface BusinessCardCellProps extends CellContext<unknown, UserExtended> {
    size?: MantineSize | string;
    avatarSize?: MantineSize | string;
}

const BusinessCardCell = ({ getValue, size = "md", avatarSize = "md" }: BusinessCardCellProps): React.JSX.Element => {
    const user: UserExtended = getValue();
    const withAvatar = useMediaQuery(`(min-width: 1200px)`, false);

    return (
        <BusinessCard
            // imageSrc={user.avatar}
            comment={`@${user.username}`}
            name={getFullUserName(user)}
            withAvatar={withAvatar}
            avatarSize={avatarSize}
            size={size}
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
