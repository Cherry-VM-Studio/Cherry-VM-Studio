import { Group, Stack, StackProps, Text, Title } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import classes from "./ResourceError.module.css";
import cs from "classnames";

export interface ResourceErrorProps extends StackProps {
    icon: TablerIcon;
    title: string;
    message: string;
}

const ResourceError = ({ icon: Icon, title, message, ...props }): React.JSX.Element => {
    return (
        <Group
            {...props}
            className={cs(classes.container, props.className)}
        >
            <Icon size={48} />
            <Stack gap="4">
                <Title order={3}>{title}</Title>
                <Text fw="500">{message}</Text>
            </Stack>
        </Group>
    );
};

export default ResourceError;
