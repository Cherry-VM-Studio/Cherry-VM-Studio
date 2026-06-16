import { IconDotsVertical, IconEdit, IconKey, IconPassword, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { ActionIcon, Button, Menu, Portal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./AccountOptionsMenu.module.css";
import DeleteAccountsModal from "../../../../modals/account/DeleteAccountsModal/DeleteAccountsModal";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import PERMISSIONS from "../../../../config/permissions.config";
import { usePermissions } from "../../../../contexts/PermissionsContext";

const AccountOptionsMenu = ({ row, refreshData, openAccountModal, openPasswordModal, accountType }): React.JSX.Element => {
    const uuid = row.id;
    const { tns } = useNamespaceTranslation("pages");
    const { hasPermissions } = usePermissions();
    const [menuOpened, { close: closeMenu, toggle: toggleMenu }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const canEdit = hasPermissions(accountType === "administrative" ? PERMISSIONS.MANAGE_ADMIN_USERS : PERMISSIONS.MANAGE_CLIENT_USERS);
    const canChangePassword = hasPermissions(accountType === "administrative" ? PERMISSIONS.CHANGE_ADMIN_PASSWORD : PERMISSIONS.CHANGE_CLIENT_PASSWORD);
    return (
        <>
            <Portal>
                <DeleteAccountsModal
                    opened={deleteModalOpened}
                    onClose={closeDeleteModal}
                    uuids={[uuid]}
                    onSubmit={refreshData}
                />
            </Portal>
            <Menu
                opened={menuOpened}
                onChange={toggleMenu}
                shadow="xl"
                position="left"
                width={200}
            >
                <Menu.Target>
                    <ActionIcon
                        variant="transparent"
                        color="dimmed"
                        size="sm"
                    >
                        <IconDotsVertical />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown
                    p={0}
                    bd={"2px solid var(--mantine-color-dark-5)"}
                >
                    <Button.Group orientation="vertical">
                        <Button
                            className={classes.button}
                            variant="default"
                            justify="right"
                            rightSection={<IconUserCircle size={20} />}
                            onClick={() => {
                                openAccountModal(uuid, false);
                                closeMenu();
                            }}
                        >
                            {tns("accounts.controls.view-profile")}
                        </Button>
                        <Button
                            className={classes.button}
                            variant="default"
                            justify="right"
                            rightSection={<IconEdit size={20} />}
                            disabled={!canEdit}
                            onClick={() => {
                                openAccountModal(uuid, true);
                                closeMenu();
                            }}
                        >
                            {tns("accounts.controls.edit-account")}
                        </Button>
                        <Button
                            className={classes.button}
                            variant="default"
                            justify="right"
                            rightSection={<IconKey size={20} />}
                            disabled={!canChangePassword}
                            onClick={() => {
                                openPasswordModal(uuid);
                                closeMenu();
                            }}
                        >
                            {tns("accounts.controls.change-password")}
                        </Button>
                        <Button
                            className={`${classes.button} ${classes.delete}`}
                            variant="default"
                            justify="right"
                            rightSection={<IconTrash size={20} />}
                            disabled={!canEdit}
                            onClick={() => {
                                openDeleteModal();
                                closeMenu();
                            }}
                        >
                            {tns("accounts.controls.delete")}
                        </Button>
                    </Button.Group>
                </Menu.Dropdown>
            </Menu>
        </>
    );
};

export default AccountOptionsMenu;
