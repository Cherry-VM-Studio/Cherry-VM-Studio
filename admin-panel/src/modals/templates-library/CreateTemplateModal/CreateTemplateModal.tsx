import { Button, Group, Modal, NumberInput, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { IsoFileImportModalProps } from "../../../types/components.types";
import { useForm } from "@mantine/form";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import classes from "./CreateTemplateModal.module.css";
import useApi from "../../../hooks/useApi";
import { AxiosError, isAxiosError } from "axios";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { ERRORS } from "../../../config/errors.config";

export interface CreateTemplateModalFormValues {
    name: string;
    ram: number;
    vcpu: number;
}

const CreateTemplateModal = ({ opened, onClose, onSubmit, ...props }: IsoFileImportModalProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "create-template");
    const { sendRequest } = useApi();
    const { handleAxiosError } = useErrorHandler();

    const maxRam = 6144;
    const maxVcpu = 8;

    const form = useForm<CreateTemplateModalFormValues>({
        initialValues: {
            name: "",
            ram: 1024,
            vcpu: 1,
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
                          : null,
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const onError = (error: AxiosError) => {
        if (error.response?.status != ERRORS.HTTP_409_DUPLICATE_ERROR) {
            handleAxiosError(error);
            return error;
        }

        form.setFieldError("name", tns("validation.name-duplicate"));
        return error;
    };

    const submitForm = form.onSubmit(async (values) => {
        const res = await sendRequest("POST", "machines/template/create", { data: values }, onError);
        if (isAxiosError(res)) return;
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
                    <Stack className={classes.inputStack}>
                        <TextInput
                            description={tns("name-note")}
                            placeholder={tns("name")}
                            w={336}
                            key={form.key("name")}
                            maxLength={24}
                            minLength={3}
                            classNames={{ input: "borderless" }}
                            {...form.getInputProps("name")}
                        />
                        <Group>
                            <NumberInput
                                label={tns("ram")}
                                description={tns("ram-description", { count: maxRam })}
                                rightSection={tns("ram-unit", { count: form.values.ram })}
                                w="160px"
                                rightSectionWidth="40px"
                                classNames={{ input: "borderless", section: classes.rightSections }}
                                max={maxRam}
                                min={0}
                                clampBehavior="strict"
                                key={form.key("ram")}
                                {...form.getInputProps("ram")}
                            />
                            <NumberInput
                                label={tns("vcpu")}
                                description={tns("vcpu-description", { count: maxVcpu })}
                                rightSection={tns("vcpu-unit", { count: form.values.vcpu })}
                                w="160px"
                                rightSectionWidth="60px"
                                classNames={{ input: "borderless", section: classes.rightSections }}
                                max={maxVcpu}
                                min={0}
                                clampBehavior="strict"
                                key={form.key("vcpu")}
                                {...form.getInputProps("vcpu")}
                            />
                        </Group>
                    </Stack>

                    <SimpleGrid
                        cols={2}
                        mt="sm"
                    >
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

export default CreateTemplateModal;
