import { Group, Loader, Stack, StackProps, Text, Title } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import classes from "./ResourceLoading.module.css";
import cs from "classnames";

export interface ResourceLoadingProps extends StackProps {
    icon: TablerIcon;
    title: string;
    message: string;
}

const ResourceLoading = ({ icon: Icon, title = "Loading", message, ...props }): React.JSX.Element => {
    return (
        <Group
            {...props}
            className={cs(classes.container, props.className)}
        >
            <Loader
                type="bars"
                color="white"
                size="32"
                mr="8"
            />
            <Stack gap="4">
                <Title order={3}>{title}</Title>
                <Text fw="500">{message}</Text>
            </Stack>
        </Group>
    );
};

export default ResourceLoading;
