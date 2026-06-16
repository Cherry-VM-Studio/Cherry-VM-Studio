import { Box, Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import classes from "./IsoFileModal.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { IconDisc } from "@tabler/icons-react";
import BusinessCard from "../../../components/atoms/display/BusinessCard/BusinessCard";
import { getFullUserName } from "../../../utils/users";
import { IsoFile, User } from "../../../types/api.types";
import ModifiableText from "../../../components/atoms/interactive/ModifiableText/ModifiableText";
import { formatBytesToRelevantUnit } from "../../../utils/files";
import useFetch from "../../../hooks/useFetch";
import { formatDate } from "../../../utils/dates";
import IconFileTypeIso from "../../../components/atoms/icons/IconFileTypeIso/IconFileTypeIso";

const IsoFileModal = ({ opened, onClose, uuid, refreshTable }): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("modals", "iso");
    const { data: file, error, loading } = useFetch<IsoFile>(uuid ? `/iso/iso/${uuid}` : undefined);

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
                                {file.name}
                            </Title>
                            <Text className={classes.titleSmall}>{formatBytesToRelevantUnit(file.file_size_bytes)} </Text>
                        </Stack>
                    </Group>

                    <Stack className={classes.details}>
                        <Group
                            className={classes.detailLabel}
                            gap="0"
                        >
                            {tns("location")}:&nbsp;
                            <ModifiableText
                                onSave={() => {}}
                                canEdit={file.remote === true} // important so that undefined doesnt ruin this
                                value={file.file_location || "Local"}
                                viewProps={{ style: { color: "var(--mantine-color-dimmed)" } }} // when i use the class it breaks smh
                                editButtonClassName={classes.editTextButton}
                            />
                        </Group>
                        <Text className={classes.detailLabel}>
                            {tns("last-used")}:
                            <Text
                                span
                                className={classes.detailValue}
                            >
                                {` ${file.last_used ? formatDate(new Date(file.last_used)) : t("never")}`}
                            </Text>
                        </Text>

                        <Group
                            w="100%"
                            gap="100"
                            align="top"
                        >
                            <Stack gap="md">
                                <Text className={classes.detailLabel}>
                                    {tns("added-on")}:
                                    <br />
                                    <Text
                                        span
                                        className={classes.detailValue}
                                    >
                                        {` ${formatDate(new Date(file.imported_at))}`}
                                    </Text>
                                </Text>
                                <Text className={classes.detailLabel}>{tns("added-by")}:</Text>
                                <BusinessCard
                                    name={getFullUserName(file.imported_by)}
                                    comment={`@${file.imported_by.username}`}
                                />
                            </Stack>
                            <Stack gap="md">
                                <Text className={classes.detailLabel}>
                                    {tns("last-modified-on")}:
                                    <br />
                                    <Text
                                        span
                                        className={classes.detailValue}
                                    >
                                        {` ${file.last_modified_at ? formatDate(new Date(file.last_modified_at)) : t("never")}`}
                                    </Text>
                                </Text>
                                <Text className={classes.detailLabel}>{tns("last-modified-by")}:</Text>
                                {file.last_modified_by ? (
                                    <BusinessCard
                                        name={getFullUserName(file.last_modified_by as User)}
                                        comment={`@${file.last_modified_by.username}`}
                                    />
                                ) : (
                                    <Text
                                        span
                                        className={classes.detailValue}
                                    >
                                        -
                                    </Text>
                                )}
                            </Stack>
                        </Group>
                    </Stack>

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

export default IsoFileModal;
