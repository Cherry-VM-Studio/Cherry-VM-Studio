import { Avatar, Group, MantineSize, Stack, Text } from "@mantine/core";
import React from "react";
import classes from "./BusinessCard.module.css";

export interface BusinessCardProps {
    imageSrc?: string;
    name: string;
    alt?: string;
    comment?: string;
    link?: string;
    withAvatar?: boolean;
    size?: MantineSize | string;
    avatarSize?: MantineSize | string;
    gap?: string | number;
}

const BusinessCard = ({
    imageSrc,
    alt,
    name,
    comment,
    link,
    withAvatar = true,
    size = "md",
    avatarSize = "md",
    gap = "md",
}: BusinessCardProps): React.JSX.Element => {
    return (
        <Group
            className={classes.container}
            gap={gap}
        >
            {withAvatar && (
                <Avatar
                    src={imageSrc}
                    alt={alt || name}
                    name={name}
                    size={avatarSize}
                    color={name && "initials"}
                />
            )}
            <Stack className={classes.textContainer}>
                <Text
                    size={size}
                    className={classes.text}
                >
                    {name}
                </Text>
                <Text
                    {...(link
                        ? {
                              component: "a",
                              href: link,
                          }
                        : {})}
                    c="dimmed"
                    size={size}
                    className={classes.text}
                >
                    {comment}
                </Text>
            </Stack>
        </Group>
    );
};

export default BusinessCard;
