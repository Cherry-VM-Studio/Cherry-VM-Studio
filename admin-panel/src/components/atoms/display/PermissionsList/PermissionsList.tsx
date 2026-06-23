import { List, ListProps } from "@mantine/core";
import PERMISSIONS from "../../../../config/permissions.config";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { User, UserExtended } from "../../../../types/api.types";

export interface PermissionsListProps extends ListProps {
    user: User | UserExtended;
}

const PermissionsList = ({ user, ...props }: PermissionsListProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("modals", "account.permission-list");

    if (user.account_type === "client")
        return (
            <List
                size="sm"
                c="dark.1"
            >
                <List.Item>{tns("client")}</List.Item>
            </List>
        );

    const hasPermission = (permissionMask: number) => (user.permissions & permissionMask) !== 0;

    const bulletpoints = [
        tns(`machines${hasPermission(PERMISSIONS.VIEW_ALL_VMS) ? "-view" : ""}${hasPermission(PERMISSIONS.MANAGE_ALL_VMS) ? "-manage" : ""}`),
        tns(`users-view`),
        hasPermission(PERMISSIONS.MANAGE_ADMIN_USERS) || hasPermission(PERMISSIONS.MANAGE_CLIENT_USERS)
            ? tns(
                  `users-manage${hasPermission(PERMISSIONS.MANAGE_ADMIN_USERS) ? "-administrative" : ""}${
                      hasPermission(PERMISSIONS.MANAGE_CLIENT_USERS) ? "-client" : ""
                  }`,
              )
            : null,
        hasPermission(PERMISSIONS.CHANGE_ADMIN_PASSWORD) || hasPermission(PERMISSIONS.CHANGE_CLIENT_PASSWORD)
            ? tns(
                  `users-password${hasPermission(PERMISSIONS.CHANGE_ADMIN_PASSWORD) ? "-administrative" : ""}${
                      hasPermission(PERMISSIONS.CHANGE_CLIENT_PASSWORD) ? "-client" : ""
                  }`,
              )
            : null,
        hasPermission(PERMISSIONS.MANAGE_ISO_FILES) ? tns("manage-iso-files") : null,
        hasPermission(PERMISSIONS.MANAGE_SYSTEM_RESOURCES) ? tns("manage-system-resources") : null,
    ].filter((e) => e);

    return (
        <List
            size="sm"
            c="dark.1"
        >
            {bulletpoints.map((bullet, i) => (
                <List.Item key={i}>{bullet}</List.Item>
            ))}
        </List>
    );
};

export default PermissionsList;
