import { Stack, Text, Title } from "@mantine/core";
import PERMISSIONS from "../../../../config/permissions.config";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { Role, RoleExtended } from "../../../../types/api.types";

// For each group, first matched mask will be chosen
const GROUP_PERMISSION_KEYS = [
    [
        { mask: PERMISSIONS.MANAGE_ALL_VMS, label: "permissions.manage-machines" },
        { mask: PERMISSIONS.VIEW_ALL_VMS, label: "permissions.view-machines" },
    ],
    [
        { mask: PERMISSIONS.MANAGE_CLIENT_USERS | PERMISSIONS.MANAGE_ADMIN_USERS, label: "permissions.manage-all-accounts" },
        { mask: PERMISSIONS.MANAGE_CLIENT_USERS, label: "permissions.manage-client-accounts" },
        { mask: PERMISSIONS.MANAGE_ADMIN_USERS, label: "permissions.manage-administrative-accounts" },
    ],
    [
        { mask: PERMISSIONS.CHANGE_CLIENT_PASSWORD | PERMISSIONS.CHANGE_ADMIN_PASSWORD, label: "permissions.modify-credentials" },
        { mask: PERMISSIONS.CHANGE_CLIENT_PASSWORD, label: "permissions.modify-clients-credentials" },
        { mask: PERMISSIONS.CHANGE_ADMIN_PASSWORD, label: "permissions.modify-administrators-credentials" },
    ],
    [{ mask: PERMISSIONS.MANAGE_ISO_FILES, label: "permissions.manage-iso-files" }],
    [{ mask: PERMISSIONS.MANAGE_SYSTEM_RESOURCES, label: "permissions.manage-system-resources" }],
];
export interface RoleInfoCardProps {
    role: Role | RoleExtended;
}

const RoleInfoCard = ({ role }: RoleInfoCardProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "accounts");

    if (!role) return <></>;

    const roleHasPermission = (required: number) => (role.permissions | required) == role.permissions;

    let description = `${tns("permissions.intro")} `;
    let matched: string[] = [];

    GROUP_PERMISSION_KEYS.forEach((group) => {
        const found = group.find(({ mask }) => roleHasPermission(mask));
        if (found) matched.push(tns(found.label));
    });

    description += `${matched.join(", ")}.`;

    return (
        <Stack gap="0">
            <Title order={6}>{role.name}</Title>
            <Text
                c="dimmed"
                size="sm"
            >
                {description}
            </Text>
        </Stack>
    );
};

export default RoleInfoCard;
