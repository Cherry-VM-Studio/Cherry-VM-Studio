import { useEffect } from "react";
import { Stack, Title, Group, TextInput, Button, Text, Box, ScrollArea } from "@mantine/core";
import { IconLabelFilled, IconAt, IconMail, IconEdit } from "@tabler/icons-react";
import classes from "./AccountEditForm.module.css";
import { useForm, hasLength, isEmail } from "@mantine/form";
import PERMISSIONS from "../../../../config/permissions.config";
import useApi from "../../../../hooks/useApi";
import useErrorHandler from "../../../../hooks/useErrorHandler";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import AccountHeading from "../../../atoms/display/AccountHeading/AccountHeading";
import RoleMultiselect from "../../../atoms/interactive/RoleMultiselect/RoleMultiselect";
import GroupMultiselect from "../../../atoms/interactive/GroupMultiselect/GroupMultiselect";
import { AxiosError } from "axios";
import { UserExtended } from "../../../../types/api.types";
import { values } from "lodash";

export interface AccountEditFormProps {
    onCancel: () => void;
    onSubmit: () => void;
    openPasswordModal: (uuid: string) => void;
    user: UserExtended;
}

const AccountEditForm = ({ onCancel, onSubmit, user, openPasswordModal }: AccountEditFormProps) => {
    const { t, tns } = useNamespaceTranslation("modals", "account");
    const { sendRequest } = useApi();
    const { handleAxiosError } = useErrorHandler();
    const { sendNotification } = useMantineNotifications();
    const { hasPermissions } = usePermissions();

    const canChangePassword = hasPermissions(user.account_type === "administrative" ? PERMISSIONS.CHANGE_ADMIN_PASSWORD : PERMISSIONS.CHANGE_CLIENT_PASSWORD);

    const form = useForm({
        initialValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            roles: [],
            groups: [],
        },
        validate: {
            name: hasLength({ max: 50 }, tns("validation.name-too-long")),
            surname: hasLength({ max: 50 }, tns("validation.surname-too-long")),
            username: (val) =>
                /\s/.test(val)
                    ? tns("validation.username-spaces")
                    : !/^[\w.-]+$/.test(val)
                      ? tns("validation.username-invalid-characters")
                      : !/[a-zA-Z]/.test(val[0])
                        ? tns("validation.username-invalid-first")
                        : val.length < 3
                          ? tns("validation.username-too-short")
                          : val.length > 24
                            ? tns("validation.username-too-long")
                            : null,
            email: (val) => (val?.length && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(val) ? tns("validation.email-invalid") : null),
        },
        onValuesChange: (values) => {
            form.setFieldValue("username", values.username.toLowerCase());
        },
    });

    const resetValues = () =>
        form.setValues({
            name: user?.name ?? "",
            surname: user?.surname ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
            roles: user.account_type === "administrative" ? values(user.roles).map((role) => role.uuid) : [],
            groups: user.account_type === "client" ? values(user.groups).map((group) => group.uuid) : [],
        });

    useEffect(() => {
        resetValues();
    }, [JSON.stringify(user)]);

    const onPostError = (error: AxiosError) => {
        const data = error.response?.data as Record<string, any>;
        const detail = data?.detail;

        if (error.response?.status === 400 && detail.includes("permission unassigned")) {
            const match = detail.match(/UUID=([a-f0-9-]+)/i);
            const roleUuid = match ? match[1] : null;
            // @ts-ignore
            const roleName = user.roles[roleUuid].name;

            form.resetField("roles");
            form.setFieldError("roles", tns("validation.cannot-revoke-role", { name: roleName }));
            return;
        }

        if (error.response?.status === 409) {
            ["username", "email"].forEach((field) => {
                if (detail?.includes(field)) form.setFieldError(field, tns(`validation.${field}-duplicate`));
            });
            return;
        }

        handleAxiosError(error);
    };

    const onFormSubmit = form.onSubmit(async (values) => {
        const res = await sendRequest("PUT", `users/modify/${user?.uuid}`, { data: values }, onPostError);
        if (!res) return;

        sendNotification("account.modified", undefined, { username: res.username });
        onSubmit?.();
    });

    return (
        <form
            onSubmit={onFormSubmit}
            style={{ position: "relative" }}
        >
            <Box className={classes.topBox} />
            <Stack className={classes.container}>
                <AccountHeading user={user} />

                <ScrollArea
                    offsetScrollbars
                    type="always"
                    scrollbarSize="0.65rem"
                    scrollbars="y"
                >
                    <Stack className={classes.content}>
                        <Title
                            order={4}
                            className={classes.sectionTitle}
                        >
                            {tns("account-details")}
                        </Title>
                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("name-surname")}</Text>
                            <TextInput
                                leftSection={<IconLabelFilled size={20} />}
                                key={form.key("name")}
                                {...form.getInputProps("name")}
                                className={classes.input}
                                classNames={{ input: "borderless" }}
                            />
                            <TextInput
                                className={classes.input}
                                key={form.key("surname")}
                                {...form.getInputProps("surname")}
                                classNames={{ input: "borderless" }}
                            />
                        </Group>

                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("username")}</Text>
                            <TextInput
                                leftSection={<IconAt size={20} />}
                                key={form.key("username")}
                                {...form.getInputProps("username")}
                                className={classes.input}
                                classNames={{ input: "borderless" }}
                            />
                        </Group>
                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("email")}</Text>
                            <TextInput
                                leftSection={<IconMail size={20} />}
                                key={form.key("email")}
                                {...form.getInputProps("email")}
                                className={classes.input}
                                classNames={{ input: "borderless" }}
                            />
                        </Group>
                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("password")}</Text>
                            <Button
                                variant="default"
                                leftSection={<IconEdit size={20} />}
                                rightSection={<></>}
                                flex="1"
                                onClick={() => openPasswordModal(user.uuid)}
                                disabled={!canChangePassword}
                                className="borderless"
                            >
                                {tns("change-password")}
                            </Button>
                            <Button
                                flex={1}
                                style={{ visibility: "hidden" }}
                            />
                        </Group>

                        {user?.account_type === "administrative" ? (
                            <>
                                <Title
                                    order={4}
                                    className={classes.sectionTitle}
                                >
                                    {tns("roles-and-permissions")}
                                </Title>
                                <RoleMultiselect
                                    className={classes.input}
                                    classNames={{ input: "borderless" }}
                                    comboboxProps={{ position: "top" }}
                                    key={form.key("roles")}
                                    {...form.getInputProps("roles")}
                                />
                            </>
                        ) : (
                            <>
                                <Title
                                    order={4}
                                    className={classes.sectionTitle}
                                >
                                    {tns("groups")}
                                </Title>
                                <GroupMultiselect
                                    className={classes.input}
                                    classNames={{ input: "borderless" }}
                                    comboboxProps={{ position: "top" }}
                                    key={form.key("groups")}
                                    {...form.getInputProps("groups")}
                                />
                            </>
                        )}
                    </Stack>
                </ScrollArea>

                <Group className={classes.buttonGroup}>
                    <Button
                        variant="light"
                        color="gray"
                        onClick={onCancel}
                        className={classes.cancelButton}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="submit"
                        variant="white"
                        c="black"
                        className={classes.saveButton}
                    >
                        {t("save")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export default AccountEditForm;
