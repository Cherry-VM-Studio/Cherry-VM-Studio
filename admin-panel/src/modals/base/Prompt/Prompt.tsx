import { Button, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
import ReactRouterPrompt from "react-router-prompt";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";

/**
 * A prompt that alerts the user when attempting to navigate away from a page with unsaved changes.
 */

export interface PromptProps {
    when: boolean;
}

interface RouterPromptRenderProps {
    isActive: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function Prompt({ when }: PromptProps) {
    const { tns, t } = useNamespaceTranslation("modals", "confirm.leaving");

    return (
        <ReactRouterPrompt
            when={when}
            beforeCancel={() => true}
            beforeConfirm={() => true}
        >
            {({ isActive, onConfirm, onCancel }: RouterPromptRenderProps) => (
                <Modal
                    opened={isActive}
                    onClose={onCancel}
                    withCloseButton={false}
                    overlayProps={{
                        backgroundOpacity: 0.55,
                        blur: 3,
                    }}
                >
                    <Stack gap="xs">
                        <Text
                            size="xl"
                            fw={600}
                        >
                            {tns("title")}
                        </Text>
                        <Text size="sm">{tns("description")}</Text>
                        <SimpleGrid
                            mt="xs"
                            cols={2}
                        >
                            <Button
                                onClick={onCancel}
                                variant="light"
                                color="gray"
                                data-autofocus
                            >
                                {t("return")}
                            </Button>
                            <Button
                                onClick={onConfirm}
                                variant="white"
                            >
                                {t("leave-page")}
                            </Button>
                        </SimpleGrid>
                    </Stack>
                </Modal>
            )}
        </ReactRouterPrompt>
    );
}
