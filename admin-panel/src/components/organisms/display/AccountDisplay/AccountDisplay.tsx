import { Stack, Group, Text, Box, Button, Title } from "@mantine/core";
import classes from "./AccountDisplay.module.css";
import PERMISSIONS from "../../../../config/permissions.config";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import AccountHeading from "../../../atoms/display/AccountHeading/AccountHeading";
import BadgeGroup from "../../../atoms/display/BadgeGroup/BadgeGroup";
import PermissionsList from "../../../atoms/display/PermissionsList/PermissionsList";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { UserExtended } from "../../../../types/api.types";
import { values } from "lodash";

export interface AccountDisplayProps {
    onClose: () => void;
    onEdit?: () => void;
    user: UserExtended;
}

const AccountDisplay = ({ onClose, onEdit, user }: AccountDisplayProps) => {
    const { t, tns } = useNamespaceTranslation("modals", "account");
    const { hasPermissions } = usePermissions();

    const canEdit = hasPermissions(user.account_type === "administrative" ? PERMISSIONS.MANAGE_ADMIN_USERS : PERMISSIONS.MANAGE_CLIENT_USERS);

    return (
        <Stack pos="relative">
            <Box className={classes.topBox} />
            <Stack className={classes.stack}>
                <AccountHeading user={user} />

                <Stack className={classes.accountDetails}>
                    <Text className={classes.detailLabel}>
                        {tns("email")}:
                        <Text
                            span
                            className={classes.detailValue}
                        >
                            {` ${user?.email || "-"}`}
                        </Text>
                    </Text>
                    <Text className={classes.detailLabel}>
                        {tns("creation-date")}:
                        <Text
                            span
                            className={classes.detailValue}
                        >
                            {` ${user?.creation_date}`}
                        </Text>
                    </Text>
                </Stack>

                <Stack ml="md">
                    <Title order={5}>{tns("permissions")}:</Title>
                    <PermissionsList user={user} />
                </Stack>
                {user?.account_type === "administrative" ? (
                    <BadgeGroup
                        label={`${tns("roles")}:`}
                        items={values(user.roles).map((r) => r.name)}
                        emptyMessage={`${t("none")}`}
                        ml="md"
                    />
                ) : (
                    <BadgeGroup
                        label={`${tns("assigned-groups")}:`}
                        items={values(user.groups).map((g) => g.name)}
                        emptyMessage={`${t("none")}`}
                        ml="md"
                    />
                )}
                <Group className={classes.buttonGroup}>
                    {onEdit ? (
                        <Button
                            className={classes.editButton}
                            variant="white"
                            onClick={onEdit}
                            disabled={!canEdit}
                        >
                            {t("edit")}
                        </Button>
                    ) : (
                        <></>
                    )}
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

export default AccountDisplay;
