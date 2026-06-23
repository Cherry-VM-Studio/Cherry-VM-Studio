import { Group, GroupProps, Loader, Stack, StackProps, Text, Title } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import classes from "./ResourceLoading.module.css";
import cs from "classnames";
import { useTranslation } from "react-i18next";

export interface ResourceLoadingProps extends GroupProps {
    icon: TablerIcon;
    title?: string;
    message: string;
}

const ResourceLoading = ({ icon: Icon, title, message, ...props }: ResourceLoadingProps): React.JSX.Element => {
    const { t } = useTranslation();

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
                <Title order={3}>{title ?? t("loading")}</Title>
                <Text fw="500">{message}</Text>
            </Stack>
        </Group>
    );
};

export default ResourceLoading;
