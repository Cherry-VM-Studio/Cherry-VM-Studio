import { ActionIcon, Avatar, Button, Checkbox, FileButton, Group, Input, Modal, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IsoFileImportModalProps } from "../../../types/components.types";
import { useForm } from "@mantine/form";
import { useRef, useState } from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { IconDisc, IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { isEmpty, isNull, values } from "lodash";
import useContinousFileUpload from "../../../hooks/useContinousFileUpload";
import useFetch from "../../../hooks/useFetch";
import { IsoFile } from "../../../types/api.types";
import classes from "./IsoFileImportModal.module.css";
import cs from "classnames";

type ImportTypes = "file" | "url";

const IsoFileImportModal = ({ opened, onClose, onSubmit, ...props }: IsoFileImportModalProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "import-iso");
    const { uploadFile } = useContinousFileUpload("/iso/upload");
    const { data: isoRecords } = useFetch<Record<string, IsoFile>>("/iso/all");

    const [importType, setImportType] = useState<ImportTypes>("file");

    const resetRef = useRef<() => void>(null);

    const takenNames = values(isoRecords).map((record: IsoFile) => record.name);

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            file: null,
            url: "",
        },
        validate: {
            name: (val) =>
                !/^[\w\s.-]+$/.test(val)
                    ? tns("validation.name-invalid-characters")
                    : !/[a-zA-Z]/.test(val[0])
                      ? tns("validation.name-invalid-first")
                      : val.length < 3
                        ? tns("validation.name-too-short")
                        : val.length > 24
                          ? tns("validation.name-too-long")
                          : takenNames.includes(val)
                            ? tns("validation.name-duplicate")
                            : null,
            file: (val: File | null) =>
                !val.name.endsWith(".iso")
                    ? tns("validation.file-invalid-extension")
                    : val.size > 10 * 1024 * 1024 * 1024
                      ? tns("validation.file-too-large")
                      : null,
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const submitForm = form.onSubmit(async (values) => {
        if (importType === "file") {
            closeModal();
            await uploadFile(values.file, { name: values.name });
        } else if (importType == "url") {
        }

        onClose();
        onSubmit?.();
    });

    const clearFile = () => {
        form.setFieldValue("file", null);
        resetRef.current?.();
    };

    const currentValues = form.getValues();

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            title={tns("title")}
            size="480"
        >
            <form onSubmit={submitForm}>
                <Stack>
                    <Group className={classes.description}>
                        <Avatar color="cherry">
                            <IconDisc />
                        </Avatar>
                        <Text>{tns("description")}</Text>
                    </Group>
                    <Stack className={classes.inputStack}>
                        <Select
                            description={tns("import-type-note")}
                            value={importType}
                            onChange={(val) => setImportType(val as ImportTypes)}
                            data={[
                                { value: "file", label: "From File" },
                                { value: "url", label: "From URL" },
                            ]}
                            classNames={{ input: "borderless" }}
                            w={300}
                            allowDeselect={false}
                        />
                        <TextInput
                            description={tns("name-note")}
                            placeholder={tns("name")}
                            w={300}
                            key={form.key("name")}
                            maxLength={24}
                            minLength={3}
                            classNames={{ input: "borderless" }}
                            {...form.getInputProps("name")}
                        />
                        {importType === "file" ? (
                            <Stack gap="xs">
                                <Group
                                    align="end"
                                    gap="0"
                                >
                                    <FileButton
                                        resetRef={resetRef}
                                        onChange={(file) => form.setFieldValue("file", file)}
                                        accept=".iso"
                                        key={form.key("file")}
                                        {...form.getInputProps("file")}
                                    >
                                        {(props) => (
                                            <Button
                                                {...props}
                                                w={currentValues.file ? 264 : 150}
                                                variant="default"
                                                className={cs("borderless", classes.fileButton)}
                                                aria-selected={!isNull(currentValues.file)}
                                                aria-invalid={!isEmpty(form.errors.file)}
                                                leftSection={isNull(currentValues.file) ? <IconUpload size={18} /> : <IconFile size={18} />}
                                            >
                                                {currentValues.file?.name || tns("upload-file")}
                                            </Button>
                                        )}
                                    </FileButton>
                                    {currentValues.file && (
                                        <ActionIcon
                                            variant="default"
                                            onClick={clearFile}
                                            c={isEmpty(form.errors.file) ? undefined : "red.7"}
                                            className={cs("borderless", classes.resetFileButton)}
                                        >
                                            <IconX />
                                        </ActionIcon>
                                    )}
                                </Group>
                                {form.errors.file && <Input.Error>{form.errors.file}</Input.Error>}
                            </Stack>
                        ) : (
                            <>
                                <TextInput
                                    description={tns("url-note")}
                                    placeholder={tns("url")}
                                    w={300}
                                    key={form.key("url")}
                                    {...form.getInputProps("url")}
                                />
                                <Checkbox
                                    className={classes.saveLocallyCheckbox}
                                    radius="sm"
                                    label={tns("save-locally")}
                                />
                            </>
                        )}
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
};

export default IsoFileImportModal;
