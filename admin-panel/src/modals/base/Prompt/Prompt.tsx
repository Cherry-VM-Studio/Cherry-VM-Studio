import { Button, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
import ReactRouterPrompt from "react-router-prompt";

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
                            You're leaving the page
                        </Text>
                        <Text size="sm">You have unsaved changes that will be permanently lost if you leave this page. Are you sure you want to continue?</Text>
                        <SimpleGrid
                            mt="xs"
                            cols={2}
                        >
                            <Button
                                onClick={onCancel}
                                variant="light"
                                color="gray"
                                radius="sm"
                                data-autofocus
                            >
                                Return
                            </Button>
                            <Button
                                onClick={onConfirm}
                                variant="light"
                                color="red.9"
                                radius="sm"
                            >
                                Leave page
                            </Button>
                        </SimpleGrid>
                    </Stack>
                </Modal>
            )}
        </ReactRouterPrompt>
    );
}
