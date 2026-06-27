import React from "react";
import AccountAvatarGroup from "../display/AccountAvatarGroup/AccountAvatarGroup";
import { values } from "lodash";

const AvatarsCell = ({ getValue }): React.JSX.Element => {
    return (
        <AccountAvatarGroup
            users={values(getValue())}
            max={10}
        />
    );
};

export default AvatarsCell;
