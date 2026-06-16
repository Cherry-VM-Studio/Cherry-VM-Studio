import { Box, Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import useFetch from "../../../hooks/useFetch";
import IconFileTypeIso from "../../../components/atoms/icons/IconFileTypeIso/IconFileTypeIso";
import classes from "./TemplateModal.module.css";

const TemplateModal = ({ opened, onClose, uuid, refreshTable }): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("modals", "template");
    const { data, error, loading } = useFetch(uuid ? `/machine-templates/machine-template/${uuid}` : undefined);

    if (loading || error) return;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            styles={{ body: { padding: 0 } }}
            withCloseButton={false}
        >
            <Stack pos="relative">
                <Box className={classes.topBox} />
                <Stack className={classes.stack}>
                    <Group className={classes.header}>
                        <IconFileTypeIso
                            size={64}
                            className={classes.icon}
                        />
                        <Stack className={classes.headerText}>
                            <Title
                                order={2}
                                className={classes.title}
                            >
                                {data.name}
                            </Title>
                            <Text className={classes.titleSmall}> </Text>
                        </Stack>
                    </Group>

                    <Stack className={classes.details}></Stack>

                    <Group className={classes.buttonGroup}>
                        <Button
                            className={classes.closeButton}
                            onClick={onClose}
                        >
                            {t("close")}
                        </Button>
                    </Group>
                </Stack>
            </Stack>
        </Modal>
    );
};

export default TemplateModal;
