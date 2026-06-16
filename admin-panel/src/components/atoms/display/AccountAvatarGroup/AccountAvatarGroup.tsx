import React from "react";
import { Avatar, AvatarProps, HoverCard, HoverCardProps, ScrollArea, Stack, Text } from "@mantine/core";
import { User } from "../../../../types/api.types";
import { isEmpty } from "lodash";
import BusinessCard from "../BusinessCard/BusinessCard";
import { getFullUserName } from "../../../../utils/users";
import classes from "./AccountAvatarGroup.module.css";

export interface AccountAvatarGroup extends HoverCardProps {
    users: User[];
    max?: number;
    avatarProps?: AvatarProps;
    dropdownLabel?: React.JSX.Element | string;
}

const AccountAvatarGroup = ({ users, max = 5, avatarProps, dropdownLabel, ...props }: AccountAvatarGroup): React.JSX.Element => {
    if (isEmpty(users)) return;

    return (
        <HoverCard
            openDelay={1000}
            {...props}
            withinPortal
        >
            <HoverCard.Target>
                <Avatar.Group>
                    {users.slice(0, max).map((user, index) => (
                        <Avatar
                            key={index}
                            alt={getFullUserName(user)}
                            name={getFullUserName(user)}
                            color="initials"
                            bd="none"
                            {...avatarProps}
                        />
                    ))}
                    {users.length > max && (
                        <Avatar
                            radius="xl"
                            bd="none"
                            {...avatarProps}
                        >
                            +{users.length - max}
                        </Avatar>
                    )}
                </Avatar.Group>
            </HoverCard.Target>
            <HoverCard.Dropdown className={classes.dropdown}>
                <Stack>
                    {dropdownLabel ? dropdownLabel : <></>}
                    <ScrollArea.Autosize
                        // className={classes.scrollArea}
                        mah="200"
                        offsetScrollbars
                        scrollbarSize="0.5rem"
                    >
                        <Stack pr="xs">
                            {users.map((user, i) => (
                                <BusinessCard
                                    key={i}
                                    size="sm"
                                    name={getFullUserName(user)}
                                    comment={`@${user.username}`}
                                />
                            ))}
                        </Stack>
                    </ScrollArea.Autosize>
                </Stack>
            </HoverCard.Dropdown>
        </HoverCard>
    );
};

export default AccountAvatarGroup;
