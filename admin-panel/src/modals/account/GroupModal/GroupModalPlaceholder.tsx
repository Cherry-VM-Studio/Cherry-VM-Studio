import { Group, Skeleton, Stack } from "@mantine/core";
import classes from "./GroupModal.module.css";

const GroupModalPlaceholder = (): React.JSX.Element => (
    <Stack className={classes.container}>
        <Group className={classes.header}>
            <Skeleton
                height="56"
                circle
            />
            <Stack flex="1">
                <Skeleton
                    w="40%"
                    height={16}
                    radius="xl"
                />
                <Skeleton
                    w="30%"
                    height={8}
                    radius="xl"
                />
            </Stack>
        </Group>
        <Group w="100%">
            <Skeleton
                height={8}
                radius="xl"
                w="100%"
            />
            <Skeleton
                height={8}
                radius="xl"
                w="100%"
            />
        </Group>
        <Stack
            w="90%"
            mt="lg"
        >
            {...Array(5).fill(
                <Group w="100%">
                    <Skeleton
                        height="40"
                        circle
                    />
                    <Stack
                        flex="1"
                        align="stretch"
                    >
                        <Skeleton
                            height={8}
                            radius="xl"
                        />
                        <Skeleton
                            height={6}
                            radius="xl"
                        />
                    </Stack>
                    <Skeleton
                        height="30"
                        w="10%"
                    ></Skeleton>
                </Group>
            )}
        </Stack>
    </Stack>
);

export default GroupModalPlaceholder;
