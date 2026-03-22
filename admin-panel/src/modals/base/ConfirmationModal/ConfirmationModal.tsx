import { Button, Modal, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation.ts";
import { ConfirmationModalProps } from "../../../types/components.types.ts";

export default function ConfirmationModal({
    modalProps,
    opened,
    message,
    title,
    cancelButtonProps,
    confirmButtonProps,
    onClose,
    onConfirm,
}: ConfirmationModalProps) {
    const { t, tns } = useNamespaceTranslation("modals");
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            withCloseButton={false}
            {...modalProps}
        >
            <Stack>
                <Title order={4}>{title}</Title>
                <Text size="sm">{message ?? tns("confirm.unsaved.description")}</Text>
                <SimpleGrid cols={2}>
                    <Button
                        onClick={onClose}
                        variant="light"
                        color="gray"
                        radius="sm"
                        data-autofocus
                        {...cancelButtonProps}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="light"
                        color="gray"
                        radius="sm"
                        {...confirmButtonProps}
                    >
                        {t("confirm")}
                    </Button>
                </SimpleGrid>
            </Stack>
        </Modal>
    );
}
