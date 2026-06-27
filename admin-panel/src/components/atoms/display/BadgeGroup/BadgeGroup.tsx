import { Badge, BadgeProps, Group, GroupProps, MantineSize, ScrollArea, Stack, StackProps, Text, Title } from "@mantine/core";
import classes from "./BadgeGroup.module.css";
import { ReactNode } from "react";
import cs from "classnames";

export interface BadgeGroupProps extends StackProps {
    items: ReactNode[];
    label?: ReactNode;
    emptyMessage?: ReactNode;
    size?: MantineSize | (string & {});
    badgeProps?: BadgeProps;
    badgeGroupProps?: GroupProps;
}

const BadgeGroup = ({ items, label, emptyMessage = "", size, badgeProps, badgeGroupProps, ...props }: BadgeGroupProps) => (
    <Stack
        {...props}
        className={cs(props.className, classes.container)}
    >
        {label && (
            <Title
                order={5}
                className={classes.label}
            >
                {label}
            </Title>
        )}

        <ScrollArea
            type="always"
            scrollbarSize="0.525rem"
            className={classes.scrollArea}
            scrollbars="y"
        >
            <Group
                {...badgeGroupProps}
                className={cs(classes.badgeGroup, badgeGroupProps?.className)}
            >
                {items.length ? (
                    items.map((item: string, index: number) => (
                        <Badge
                            key={index}
                            variant="light"
                            color="gray"
                            size={size || "lg"}
                            fw={500}
                            {...badgeProps}
                            className={cs(badgeProps?.className, classes.badge)}
                        >
                            {item}
                        </Badge>
                    ))
                ) : (
                    <Text
                        fz="sm"
                        className={classes.emptyMessage}
                    >
                        {emptyMessage}
                    </Text>
                )}
            </Group>
        </ScrollArea>
    </Stack>
);

export default BadgeGroup;
