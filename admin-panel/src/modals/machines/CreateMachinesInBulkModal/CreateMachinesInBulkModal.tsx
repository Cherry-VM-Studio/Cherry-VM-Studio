import { Button, Checkbox, Group, Modal, NumberInput, Paper, Pill, PillGroup, ScrollArea, Select, Stack, Text } from "@mantine/core";
import classes from "./CreateMachinesInBulkModal.module.css";
import ListInput from "../../../components/atoms/interactive/ListInput/ListInput";
import { useForm } from "@mantine/form";
import { CreateMachineFormSubmitValues, CreateMachineModalStack } from "../CreateMachineModal/CreateMachineModal";
import { useState } from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { IconAlertCircle, IconDeviceDesktop } from "@tabler/icons-react";
import { keys, values } from "lodash";
import useFetch from "../../../hooks/useFetch";
import { Group as GroupType } from "../../../types/api.types";
import useApi from "../../../hooks/useApi";
import { notifications } from "@mantine/notifications";
import { AxiosError, isAxiosError } from "axios";
import useErrorHandler from "../../../hooks/useErrorHandler";

interface MachinesField {
    machine_config: CreateMachineFormSubmitValues;
    machine_count: number;
}

export interface CreateMachinesInBulkFormValues {
    machines: MachinesField[];
    group: null | string;
    create_for_group_mode: boolean;
}

export interface CreateMachinesInBulkModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const CreateMachinesInBulkModal = ({ opened, onSubmit, onClose }: CreateMachinesInBulkModalProps): React.JSX.Element => {
    const { sendRequest } = useApi();
    const { tns, t } = useNamespaceTranslation("modals", "create-machines-in-bulk");
    const { data: groups } = useFetch<Record<string, GroupType>>("/groups/all");

    const [supportModalOpened, setSupportModalOpened] = useState(false);

    const form = useForm<CreateMachinesInBulkFormValues>({
        initialValues: {
            machines: [],
            group: null,
            create_for_group_mode: false,
        },
        validate: {
            group: (val, values) => (values.create_for_group_mode && !val ? tns("validation.group-not-selected") : null),
        },
    });

    const createEntry = () => {
        setSupportModalOpened(true);
    };

    const onSupportModalClosed = () => {
        setSupportModalOpened(false);
    };

    const addMachine = (machine: CreateMachineFormSubmitValues) => {
        form.setFieldValue("machines", (prev) => [...prev, { machine_config: machine, machine_count: 1 }]);
        onSupportModalClosed();
    };

    const removeMachine = (index: number) => {
        form.setFieldValue("machines", (prev) => prev.filter((_, i) => i !== index));
    };

    const close = () => {
        form.reset();
        onClose();
    };

    const getNumberOfMachines = (values: CreateMachinesInBulkFormValues) =>
        values.machines.reduce((prev, curr) => prev + curr.machine_count, 0) * (values.create_for_group_mode ? (keys(groups[values.group]?.users)?.length ?? 1) : 1);

    const groupsInSelect = values(groups).map((group: GroupType) => ({ label: group.name, value: group.uuid }));

    const numberOfMachines = getNumberOfMachines(form.values);

    const submit = form.onSubmit(async (values) => {
        close();

        const count = getNumberOfMachines(values);

        const notification = notifications.show({
            color: "yellow",
            title: tns("creating.title"),
            message: tns("creating.description", { count }),
            autoClose: false,
            loading: true,
            withCloseButton: true,
        });

        const endpoint = values.create_for_group_mode ? `/machines/create/for-group?group_uuid=${values.group}` : `/machine/create/bulk`;
        const res = await sendRequest("POST", endpoint, { data: values.machines });

        if (isAxiosError(res)) {
            notifications.update({
                id: notification,
                loading: false,
                color: "red",
                title: tns("creating-error.title"),
                message: tns("creating-error.description", { count }),
                autoClose: false,
                withCloseButton: true,
            });
        } else {
            notifications.update({
                id: notification,
                loading: false,
                color: "lime",
                title: tns("creating-success.title"),
                message: tns("creating-success.description", { count }),
                autoClose: 3000,
            });
        }

        onSubmit?.();
    });

    return (
        <Group>
            <Modal
                opened={opened}
                onClose={onClose}
                title={tns("title")}
                size="xl"
                classNames={{ title: classes.title }}
            >
                <ScrollArea
                    h="500px"
                    mb="lg"
                    type="always"
                    offsetScrollbars
                >
                    <Text>{tns("set-of-machines")}</Text>
                    <Text className={classes.description}>{tns("description.set-of-machines")}</Text>
                    <Stack className={classes.mainStack}>
                        <Stack gap="xs">
                            <Paper className={classes.formBorder}>
                                {!form.values.machines.length ? (
                                    <Button
                                        className="borderless"
                                        variant="default"
                                        onClick={createEntry}
                                        leftSection={<IconDeviceDesktop size={18} />}
                                    >
                                        {tns("add-first-machine")}
                                    </Button>
                                ) : (
                                    <ListInput
                                        values={form.values.machines}
                                        row={(value: MachinesField, index) => (
                                            <>
                                                <Group className={classes.rowGroup}>
                                                    <Group className={classes.machineDetail}>
                                                        <IconDeviceDesktop size={18} />
                                                        <Text size="sm">{value.machine_config.title}</Text>
                                                        <PillGroup>
                                                            {value.machine_config.tags.map((tag) => (
                                                                <Pill>{tag}</Pill>
                                                            ))}
                                                        </PillGroup>
                                                        <Text
                                                            size="sm"
                                                            ml="auto"
                                                            mr="sm"
                                                            c="dimmed"
                                                            tt="capitalize"
                                                        >
                                                            {value.machine_config.source_type}
                                                        </Text>
                                                    </Group>
                                                </Group>
                                                <NumberInput
                                                    classNames={{ input: "borderless" }}
                                                    w="70px"
                                                    key={form.key(`machines.${index}.machine_count`)}
                                                    {...form.getInputProps(`machines.${index}.machine_count`)}
                                                />
                                            </>
                                        )}
                                        createEntry={createEntry}
                                        removeEntry={removeMachine}
                                    />
                                )}
                            </Paper>
                        </Stack>

                        <Stack gap="0">
                            <Text size="md">{tns("create-for-group")}</Text>
                            <Text className={classes.description}>{tns("description.create-for-group")}</Text>
                            <Paper className={classes.formBorder}>
                                <Stack>
                                    <Checkbox
                                        radius="sm"
                                        label={tns("create-for-group-mode")}
                                        key={form.key("create_for_group_mode")}
                                        {...form.getInputProps("create_for_group_mode")}
                                    />
                                    {form.values.create_for_group_mode && (
                                        <Select
                                            label={tns("select-group")}
                                            data={groupsInSelect}
                                            nothingFoundMessage={t("nothing-found")}
                                            key={form.key("group")}
                                            {...form.getInputProps("group")}
                                        />
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Stack>
                </ScrollArea>
                {!!numberOfMachines && (
                    <Group className={classes.warning}>
                        <IconAlertCircle size={18} />
                        <Text size="sm">{tns("number-warning", { count: numberOfMachines })}</Text>
                    </Group>
                )}
                <Group justify="center">
                    <Button
                        className={classes.closeButton}
                        onClick={close}
                    >
                        {t("close")}
                    </Button>
                    <Button
                        variant="white"
                        className={classes.submitButton}
                        onClick={() => submit()}
                    >
                        {t("create")}
                    </Button>
                </Group>
            </Modal>
            <CreateMachineModalStack
                opened={supportModalOpened}
                onClose={onSupportModalClosed}
                onSubmit={addMachine}
            />
        </Group>
    );
};

export default CreateMachinesInBulkModal;
