import { Button, ButtonProps, Modal, ModalProps, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation.ts";

export interface ConfirmationModalProps {
    opened: boolean;
    modalProps?: ModalProps;
    message?: string;
    title?: string;
    cancelButtonProps?: ButtonProps;
    confirmButtonProps?: ButtonProps;
    onClose: () => void;
    onConfirm: () => void;
}

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
                        variant="white"
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
