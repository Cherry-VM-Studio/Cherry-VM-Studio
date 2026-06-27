import { Box, Group, Skeleton, Stack } from "@mantine/core";
import React from "react";

const PlaceholderAccountTableRecord = (): React.JSX.Element => {
    return (
        <Group
            h="80px"
            w="100%"
            align="center"
        >
            <Skeleton
                height={18}
                width={18}
                m="md"
                radius="sm"
            />
            <Skeleton
                circle
                h="36"
                w="36"
            />
            <Stack
                flex="2"
                miw="200"
            >
                <Skeleton
                    w="100%"
                    h="8"
                />
                <Skeleton
                    w="100%"
                    h="5"
                />
            </Stack>
            <Group
                flex="3"
                miw="200"
            >
                <Skeleton
                    flex="1"
                    h="12"
                />
                <Skeleton
                    flex="1"
                    h="12"
                />
                <Skeleton
                    flex="1"
                    h="12"
                />
            </Group>
            <Group
                flex="2"
                miw="200"
                justify="center"
            >
                <Skeleton
                    w="100%"
                    h="6"
                />
            </Group>
            <Skeleton
                height={18}
                width={18}
                m="md"
                radius="sm"
            />
        </Group>
    );
};

export default PlaceholderAccountTableRecord;
