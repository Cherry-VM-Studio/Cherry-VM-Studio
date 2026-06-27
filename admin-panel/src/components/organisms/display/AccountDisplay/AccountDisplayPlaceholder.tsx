import { Box, Button, Group, Skeleton, Stack, Text } from "@mantine/core";
import classes from "./AccountDisplay.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import AccountHeadingPlaceholder from "../../../atoms/display/AccountHeading/AccountHeadingPlaceholder";

const AccountModalPlaceholder = ({ onClose }): React.JSX.Element => {
    const { t } = useNamespaceTranslation("modals", "account");

    return (
        <Stack pos="relative">
            <Box className={classes.topBox} />
            <Stack className={classes.stack}>
                <AccountHeadingPlaceholder />

                <Stack className={classes.accountDetails}>
                    <Skeleton
                        height={16}
                        width={200}
                    />
                    <Skeleton
                        height={16}
                        width={200}
                    />
                </Stack>

                <Stack
                    ml="md"
                    mt="md"
                >
                    <Skeleton
                        height={16}
                        width={200}
                    />
                    <Skeleton
                        height={8}
                        width={400}
                    />
                    <Skeleton
                        height={8}
                        width={400}
                    />
                    <Skeleton
                        height={8}
                        width={400}
                    />
                </Stack>

                <Skeleton
                    height={16}
                    width={150}
                    ml="md"
                    mt="md"
                />
                <Group ml="md">
                    <Skeleton
                        height={8}
                        width={150}
                    />
                    <Skeleton
                        height={8}
                        width={100}
                    />
                    <Skeleton
                        height={8}
                        width={200}
                    />
                    <Skeleton
                        height={8}
                        width={195}
                    />
                </Group>

                <Group className={classes.buttonGroup}>
                    <Button
                        className={classes.editButton}
                        variant="white"
                    >
                        {t("edit")}
                    </Button>
                    <Button
                        className={classes.closeButton}
                        onClick={onClose}
                    >
                        {t("close")}
                    </Button>
                </Group>
            </Stack>
        </Stack>
    );
};

export default AccountModalPlaceholder;
