import { ActionIcon, Avatar, AvatarProps, Badge, Box, Button, Group, Modal, Popover, PopoverProps, Portal, Stack, Title } from "@mantine/core";
import useFetch from "../../../../hooks/useFetch";
import { getFullUserName } from "../../../../utils/users";
import classes from "./ProfileButton.module.css";
import cs from "classnames";
import BusinessCard from "../../../atoms/display/BusinessCard/BusinessCard";
import ModalButton from "../../../atoms/interactive/ModalButton/ModalButton";
import AccountModal from "../../../../modals/account/AccountModal/AccountModal";
import { useState } from "react";
import ChangePasswordModal from "../../../../modals/account/ChangePasswordModal/ChangePasswordModal";
import { useAuthentication } from "../../../../contexts/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AccountModalPlaceholder from "../../../organisms/display/AccountDisplay/AccountDisplayPlaceholder";
import AccountDisplay from "../../../organisms/display/AccountDisplay/AccountDisplay";
import { IconKey, IconLogout, IconUserCircle, IconX } from "@tabler/icons-react";
import { UserExtended } from "../../../../types/api.types";

export interface ProfileButtonProps {
    targetProps?: AvatarProps;
    popoverProps?: PopoverProps;
}

const ProfileButton = ({ targetProps, popoverProps }: ProfileButtonProps): React.JSX.Element => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { logout } = useAuthentication();
    const { data: user, loading, error, refresh } = useFetch<UserExtended>("/users/me");
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [modalsOpened, setModalsOpened] = useState({
        account: false,
        password: false,
    });

    const openPasswordModal = () => {
        setPopoverOpened(false);
        setModalsOpened((prev) => ({ ...prev, password: true }));
    };

    const closePasswordModal = () => setModalsOpened((prev) => ({ ...prev, password: false }));

    const openAccountModal = () => {
        setPopoverOpened(false);
        setModalsOpened((prev) => ({ ...prev, account: true }));
    };

    const closeAccountModal = () => setModalsOpened((prev) => ({ ...prev, account: false }));

    const onClickLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            <Portal>
                <Modal
                    opened={modalsOpened.account}
                    onClose={close}
                    size="lg"
                    styles={{ body: { padding: 0 } }}
                    withCloseButton={false}
                >
                    {loading || error || !user ? (
                        <AccountModalPlaceholder onClose={closeAccountModal} />
                    ) : (
                        <AccountDisplay
                            user={user}
                            onClose={closeAccountModal}
                        />
                    )}
                </Modal>
                <ChangePasswordModal
                    uuid={user?.uuid}
                    opened={modalsOpened.password}
                    onClose={closePasswordModal}
                />
            </Portal>
            <Popover
                opened={!loading && popoverOpened}
                onChange={setPopoverOpened}
                position="right"
                withArrow
                width={300}
                offset={18}
                {...popoverProps}
                classNames={{ dropdown: classes.dropdown }}
            >
                <Popover.Target>
                    <Avatar
                        alt={user ? getFullUserName(user) : ""}
                        name={user ? getFullUserName(user) : ""}
                        color="initials"
                        className={classes.avatar}
                        size="50"
                        {...targetProps}
                        onClick={() => setPopoverOpened((o) => !o)}
                    />
                </Popover.Target>
                <Popover.Dropdown>
                    <Stack
                        gap="xs"
                        p="xs"
                        pb="sm"
                        pt="sm"
                    >
                        <Group
                            w="100%"
                            justify="space-between"
                        >
                            <Title order={6}>{t("logged-in-as")}:</Title>
                            <ActionIcon
                                variant="transparent"
                                c="dark.2"
                                size="18"
                                style={{ alignSelf: "start" }}
                                onClick={() => setPopoverOpened(false)}
                            >
                                <IconX size="18" />
                            </ActionIcon>
                        </Group>
                        <Group
                            w="100%"
                            justify="space-between"
                            wrap="nowrap"
                        >
                            <Box className={classes.businessCard}>
                                <BusinessCard
                                    name={user ? getFullUserName(user) : ""}
                                    comment={`@${user?.username}`}
                                    size="sm"
                                    gap="xs"
                                />
                            </Box>
                            <Badge
                                variant="outline"
                                color={user?.account_type === "administrative" ? "cherry" : "teal"}
                                size="sm"
                                fw={600}
                                className={classes.badge}
                            >
                                {user?.account_type === "administrative" ? t("admin") : t("client")}
                            </Badge>
                        </Group>
                    </Stack>
                    <Stack gap="0">
                        <Button
                            onClick={openAccountModal}
                            variant="default"
                            justify="start"
                            className={classes.button}
                            leftSection={<IconUserCircle size="20" />}
                        >
                            {t("view-profile")}
                        </Button>
                        <Button
                            onClick={openPasswordModal}
                            variant="default"
                            justify="start"
                            className={classes.button}
                            leftSection={<IconKey size="20" />}
                        >
                            {t("change-password")}
                        </Button>
                        <Button
                            onClick={onClickLogout}
                            variant="default"
                            justify="start"
                            className={classes.button}
                            leftSection={<IconLogout size="20" />}
                        >
                            {t("log-out")}
                        </Button>
                    </Stack>
                </Popover.Dropdown>
            </Popover>
        </>
    );
};

export default ProfileButton;
