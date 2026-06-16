import { Button, Group, Modal, PasswordInput, Stack } from "@mantine/core";
import { matchesField, useForm } from "@mantine/form";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import useApi from "../../../hooks/useApi";

const ChangePasswordModal = ({ uuid, opened, onClose }) => {
    const { t, tns } = useNamespaceTranslation("modals", "account");
    const { sendRequest } = useApi();

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            password: "",
            confirmPassword: "",
        },

        validate: {
            password: (val) =>
                val.length < 10
                    ? tns("validation.password-too-short")
                    : !/[0-9]/.test(val)
                      ? tns("validation.password-no-number")
                      : !/[a-z]/.test(val)
                        ? tns("validation.password-no-lowercase")
                        : !/[A-Z]/.test(val)
                          ? tns("validation.password-no-uppercase")
                          : !/[$&+,:;=?@#|'<>.^*()%!_-]/.test(val)
                            ? tns("validation.password-no-special")
                            : null,
            confirmPassword: matchesField("password", tns()),
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const onSubmit = form.onSubmit(async ({ password }) => {
        await sendRequest("PUT", `/users/change-password/${uuid}`, { data: { password } });
        closeModal();
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={tns("change-password")}
        >
            <form onSubmit={onSubmit}>
                <Stack
                    gap="sm"
                    pt="4"
                >
                    <PasswordInput
                        label={tns("new-password")}
                        placeholder={tns("new-password-placeholder")}
                        styles={{
                            input: {
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                            innerInput: {
                                padding: "16px",
                            },
                        }}
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                        withAsterisk
                    />
                    <PasswordInput
                        label={tns("confirm-password")}
                        placeholder={tns("confirm-password-placeholder")}
                        styles={{
                            input: {
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                            innerInput: {
                                padding: "16px",
                            },
                        }}
                        key={form.key("confirmPassword")}
                        {...form.getInputProps("confirmPassword")}
                        withAsterisk
                    />
                    <Group
                        w="100%"
                        justify="center"
                        pt="md"
                    >
                        <Button
                            variant="default"
                            bd="none"
                            onClick={closeModal}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="white"
                            c="black"
                            type="submit"
                        >
                            {t("confirm")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
