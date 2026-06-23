import { Group, GroupProps, Stack, StackProps, Text, Title } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import classes from "./ResourceError.module.css";
import cs from "classnames";
import { useTranslation } from "react-i18next";

export interface ResourceErrorProps extends GroupProps {
    icon: TablerIcon;
    title?: string;
    message: string;
}

const ResourceError = ({ icon: Icon, title, message, ...props }: ResourceErrorProps): React.JSX.Element => {
    const { t } = useTranslation();
    return (
        <Group
            {...props}
            className={cs(classes.container, props.className)}
        >
            <Icon size={48} />
            <Stack gap="4">
                <Title order={3}>{title ?? t("error")}</Title>
                <Text fw="500">{message}</Text>
            </Stack>
        </Group>
    );
};

export default ResourceError;
