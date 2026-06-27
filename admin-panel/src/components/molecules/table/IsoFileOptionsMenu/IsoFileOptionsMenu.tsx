import { IconDisc, IconDotsVertical, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { ActionIcon, Button, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./IsoFileOptionsMenu.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";

const IsoFileOptionsMenu = ({ row, refreshData }): React.JSX.Element => {
    const uuid = row.id;
    const { tns } = useNamespaceTranslation("pages");
    const [menuOpened, { close: closeMenu, toggle: toggleMenu }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

    return (
        <>
            {/* <Portal></Portal> */}
            <Menu
                opened={menuOpened}
                onChange={toggleMenu}
                shadow="xl"
                position="left"
                width={160}
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
                            rightSection={<IconDisc size={20} />}
                            onClick={() => {
                                closeMenu();
                            }}
                        >
                            {tns("iso.controls.view-and-edit")}
                        </Button>
                        <Button
                            className={`${classes.button} ${classes.delete}`}
                            variant="default"
                            justify="right"
                            rightSection={<IconTrash size={20} />}
                            onClick={() => {
                                openDeleteModal();
                                closeMenu();
                            }}
                        >
                            {tns("iso.controls.delete")}
                        </Button>
                    </Button.Group>
                </Menu.Dropdown>
            </Menu>
        </>
    );
};

export default IsoFileOptionsMenu;
