import React from "react";
import AccountAvatarGroup from "../display/AccountAvatarGroup/AccountAvatarGroup";
import { values } from "lodash";
import { CellContext } from "@tanstack/react-table";
import { User, UserExtended } from "../../../types/api.types";

const AvatarsCell = ({ getValue }: CellContext<unknown, User[] | UserExtended[]>): React.JSX.Element => {
    return (
        <AccountAvatarGroup
            users={getValue()}
            max={10}
        />
    );
};

export default AvatarsCell;
