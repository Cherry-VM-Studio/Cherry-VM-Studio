import { isNotEmpty, useForm } from "@mantine/form";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { Modal, Stack, Text, useModalsStack } from "@mantine/core";
import { useEffect, useState } from "react";
import classes from "./CreateMachineModal.module.css";
import { MachineDisk, MachineDiskForm } from "../../../types/api.types";
import useApi from "../../../hooks/useApi";
import { toBytes } from "../../../utils/files";
import MachineDetailsFieldset, {
    MachineConnectionProtocolsFormValues,
} from "../../../components/molecules/forms/MachineDetailsFieldset/MachineDetailsFieldset";
import FormControlButtons from "../../../components/atoms/interactive/FormControlButtons/FormControlButtons";
import MachineConfigFieldset from "../../../components/molecules/forms/MachineConfigFieldset/MachineConfigFieldset";
import MachineSourceFieldset from "../../../components/molecules/forms/MachineSourceFieldset/MachineSourceFieldset";
import MachineDisksFieldset from "../../../components/molecules/forms/MachineDisksFieldset/MachineDisksFieldset";
import { keys } from "lodash";

export interface CreateMachineFormValues {
    title: string;
    tags: string[];
    description: string;
    assigned_clients: string[];
    source_type: "iso" | "snapshot";
    source_uuid: string | null;
    config: {
        ram: number;
        vcpu: number;
    };
    disks: MachineDiskForm[];
    os_disk: number;
    connection_protocols: MachineConnectionProtocolsFormValues;
}

export interface CreateMachineFormSubmitValues extends Omit<CreateMachineFormValues, "disks" | "connection_protocols"> {
    disks: MachineDisk[];
    connection_protocols: {
        vnc: boolean;
        rdp: boolean;
        ssh: boolean;
    };
}

export interface CreateMachineModalStackProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: CreateMachineFormSubmitValues) => void;
}

export interface CreateMachineModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

export const CreateMachineModalStack = ({ opened, onClose, onSubmit }: CreateMachineModalStackProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("modals", "create-machine");

    const [configTemplate, setConfigTemplate] = useState<string>("custom");

    const stack = useModalsStack(["details-page", "source-page", "config-page", "disks-page"]);

    const form = useForm<CreateMachineFormValues>({
        initialValues: {
            title: "New Machine",
            tags: [],
            description: "",
            assigned_clients: [],
            source_type: "iso",
            source_uuid: null,
            config: {
                ram: 1024,
                vcpu: 1,
            },
            disks: [{ name: "System", size: 10, unit: "GiB", type: "qcow2" }],
            os_disk: 0,
            connection_protocols: "vnc+ssh",
        },
        validateInputOnChange: false,
        validateInputOnBlur: true,
        validate: {
            title: (val) =>
                !/^[\w\s.-]+$/.test(val)
                    ? tns("validation.name-invalid-characters")
                    : !/[a-zA-Z]/.test(val[0])
                      ? tns("validation.name-invalid-first")
                      : val.length < 3
                        ? tns("validation.name-too-short")
                        : val.length > 24
                          ? tns("validation.name-too-long")
                          : null,
            tags: (val) =>
                val
                    .map((tag) => {
                        if (!/^[\w\s.-]+$/.test(tag)) return tns("validation.tags-invalid-characters");
                        if (!/[a-zA-Z]/.test(tag[0])) return tns("validation.tags-invalid-first");
                        return null;
                    })
                    .find((e) => e) || null,
            source_uuid: isNotEmpty(tns("validation.source-uuid-empty")),
            disks: {
                name: (val) =>
                    /\s/.test(val)
                        ? tns("validation.name-spaces")
                        : val.length < 3
                          ? tns("validation.name-too-short")
                          : val.length > 24
                            ? tns("validation.name-too-long")
                            : !/^[\w.-]+$/.test(val)
                              ? tns("validation.name-invalid-characters")
                              : !/[a-zA-Z]/.test(val[0])
                                ? tns("validation.name-invalid-first")
                                : null,
            },
        },
    });

    useEffect(() => {
        if (opened) {
            form.reset();
            setConfigTemplate("custom");
            stack.open("details-page");
        } else stack.closeAll();
    }, [opened]);

    useEffect(() => {
        setConfigTemplate("custom");
    }, [form.values.config.ram, form.values.config.vcpu]);

    const resetSourcePage = () => {
        form.resetField("source_type");
        form.resetField("source_uuid");
    };

    const resetConfigPage = () => {
        setConfigTemplate("custom");
        form.resetField("config");
    };

    const resetDisksPage = () => {
        form.resetField("disks");
    };

    const validateDetailsForm = () => {
        form.validateField("title");
        form.validateField("tags");
        return form.isValid("title") && form.isValid("tags");
    };

    const validateSourceForm = () => {
        form.validateField("source_uuid");
        return form.isValid("source_uuid");
    };

    const validateDisksForm = () => {
        form.values.disks.forEach((disk, i) => keys(disk).forEach((key) => form.validateField(`disks.${i}.${key}`)));
        return form.values.disks.every((disk, i) => keys(disk).every((key) => form.isValid(`disks.${i}.${key}`)));
    };

    const handleSubmit = (values: CreateMachineFormValues) => {
        const transformedValues: CreateMachineFormSubmitValues = {
            ...values,
            disks: values.disks.map((disk) => ({
                name: disk.name,
                type: disk.type,
                size_bytes: toBytes(disk.size, disk.unit),
            })),
            connection_protocols: {
                vnc: values.connection_protocols.includes("vnc"),
                rdp: values.connection_protocols.includes("rdp"),
                ssh: values.connection_protocols.includes("ssh"),
            },
        };
        onSubmit(transformedValues);
    };

    return (
        <Modal.Stack>
            <Modal
                {...stack.register("details-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <MachineDetailsFieldset<CreateMachineFormValues>
                    form={form}
                    i18nextNamespace="modals"
                    i18nextPrefix="create-machine"
                />
                <FormControlButtons
                    onClose={onClose}
                    onSubmit={() => {
                        if (validateDetailsForm()) {
                            stack.open("source-page");
                            stack.close("details-page");
                        }
                    }}
                    classNames={{
                        close: classes.closeButton,
                        submit: classes.nextButton,
                    }}
                    label={{
                        close: t("close"),
                        submit: t("next"),
                    }}
                />
            </Modal>
            <Modal
                {...stack.register("source-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <MachineSourceFieldset<CreateMachineFormValues> form={form} />
                <FormControlButtons
                    onClose={() => {
                        resetSourcePage();
                        stack.open("details-page");
                        stack.close("source-page");
                    }}
                    onSubmit={() => {
                        if (validateSourceForm()) {
                            stack.open("config-page");
                            stack.close("source-page");
                        }
                    }}
                    classNames={{
                        close: classes.closeButton,
                        submit: classes.nextButton,
                    }}
                    label={{
                        close: t("previous"),
                        submit: t("next"),
                    }}
                />
            </Modal>
            <Modal
                {...stack.register("config-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <MachineConfigFieldset<CreateMachineFormValues>
                    form={form}
                    configTemplate={configTemplate}
                    setConfigTemplate={setConfigTemplate}
                    i18nextNamespace="modals"
                    i18nextPrefix="create-machine"
                />
                <FormControlButtons
                    onClose={() => {
                        resetConfigPage();
                        stack.open("source-page");
                        stack.close("config-page");
                    }}
                    onSubmit={() => {
                        stack.open("disks-page");
                        stack.close("config-page");
                    }}
                    classNames={{
                        close: classes.closeButton,
                        submit: classes.nextButton,
                    }}
                    label={{
                        close: t("previous"),
                        submit: t("next"),
                    }}
                />
            </Modal>
            <Modal
                {...stack.register("disks-page")}
                title={tns("title-disks")}
                styles={{ title: { fontWeight: 500, fontSize: 20 } }}
                onClose={onClose}
                size="680px"
            >
                <Stack>
                    <Text className={classes.description}>{tns("description-disks")}</Text>
                    <MachineDisksFieldset<CreateMachineFormValues>
                        form={form}
                        i18nextNamespace="modals"
                        i18nextPrefix="create-machine"
                    />
                </Stack>
                <FormControlButtons
                    onClose={() => {
                        resetDisksPage();
                        stack.open("config-page");
                        stack.close("disks-page");
                    }}
                    onSubmit={() => {
                        if (validateDisksForm()) {
                            stack.close("disks-page");
                            handleSubmit(form.values);
                        }
                    }}
                    classNames={{
                        close: classes.closeButton,
                        submit: classes.nextButton,
                    }}
                    label={{
                        close: t("previous"),
                        submit: t("create"),
                    }}
                />
            </Modal>
        </Modal.Stack>
    );
};

export const CreateMachineModal = ({ opened, onClose, onSubmit }: CreateMachineModalProps): React.JSX.Element => {
    const { sendRequest } = useApi();

    const submitMachine = async (values: CreateMachineFormSubmitValues) => {
        await sendRequest("POST", "/machines/create", { data: values });

        onClose();
        onSubmit?.();
    };

    return (
        <CreateMachineModalStack
            opened={opened}
            onSubmit={submitMachine}
            onClose={onClose}
        />
    );
};

export default CreateMachineModal;
