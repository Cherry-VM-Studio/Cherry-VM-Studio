import { Avatar, Button, Group, Modal, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { useForm } from "@mantine/form";
import useApi from "../../../hooks/useApi";
import { IconUsersGroup } from "@tabler/icons-react";
import useFetch from "../../../hooks/useFetch";
import useErrorHandler from "../../../hooks/useErrorHandler";
import useMantineNotifications from "../../../hooks/useMantineNotifications";
import UserMultiselect from "../../../components/molecules/interactive/UserMultiselect/UserMultiselect";
import { safeObjectValues } from "../../../utils/misc";
import { AxiosError } from "axios";
import { ClientExtended } from "../../../types/api.types";

export default function CreateGroupModal({ opened, onClose, onSubmit }): React.JSX.Element {
    const { t, tns } = useNamespaceTranslation("modals", "create-group");
    const { sendRequest } = useApi();
    const { handleAxiosError } = useErrorHandler();
    const { sendNotification } = useMantineNotifications();
    const { data: users, error, loading } = useFetch<Record<string, ClientExtended>>("users/all?account_type=client");

    const form = useForm({
        initialValues: {
            name: "",
            users: [],
        },

        validate: {
            name: (val) => (val.length < 3 ? tns("validation.name-too-short") : val.length > 50 ? tns("validation.name-too-long") : null),
            users: (val) => !val.length && tns("validation.clients-too-few"),
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const onPostError = (error: AxiosError) => {
        if (error.response?.status != 409) handleAxiosError(error);

        const data = error.response?.data as Record<string, any>;
        const detail = data?.detail;

        if (detail.includes("name")) form.setFieldError("name", tns("validation.name-duplicate"));
    };

    const submitForm = form.onSubmit(async (values) => {
        const res = await sendRequest("POST", "groups/create", { data: values }, onPostError);
        if (!res) return;

        sendNotification("group.created", undefined, { name: res.name });
        closeModal();
        onSubmit?.();
    });

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            title={tns("title")}
            size="480"
        >
            <form onSubmit={submitForm}>
                <Stack>
                    <Group
                        wrap="nowrap"
                        gap="sm"
                    >
                        <Avatar color="cherry">
                            <IconUsersGroup />
                        </Avatar>
                        <Text size="sm">{tns("description")}</Text>
                    </Group>
                    <Stack gap="xs">
                        <TextInput
                            description={tns("name-note")}
                            placeholder={tns("name")}
                            w={300}
                            bd="none"
                            classNames={{ input: "borderless" }}
                            key={form.key("name")}
                            {...form.getInputProps("name")}
                        />
                        <UserMultiselect
                            placeholder={tns("select-clients")}
                            nothingFoundMessage={loading ? t("loading") : error ? t("error-clients") : false}
                            users={safeObjectValues(users)}
                            classNames={{ input: "borderless" }}
                            key={form.key("users")}
                            {...form.getInputProps("users")}
                        />
                    </Stack>

                    <SimpleGrid cols={2}>
                        <Button
                            onClick={closeModal}
                            variant="light"
                            color="cherry.9"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="light"
                            color="suse-green.8"
                        >
                            {t("confirm")}
                        </Button>
                    </SimpleGrid>
                </Stack>
            </form>
        </Modal>
    );
}
