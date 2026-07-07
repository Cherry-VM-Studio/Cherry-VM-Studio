import { Button, Fieldset, Stack, Tabs } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { IconCheck, IconDeviceDesktopCog, IconDeviceFloppy, IconListDetails, IconTopologyStar3, IconUsers } from "@tabler/icons-react";
import { ClientExtended, Machine, MachineDisk, MachineDiskForm, MachinePropertiesPayload, MachineState, UserExtended } from "../../../../types/api.types";
import { useForm } from "@mantine/form";
import MembersTable from "../../tables/MembersTable/MembersTable";
import useFetch from "../../../../hooks/useFetch";
import classes from "./MachineEditForm.module.css";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import _, { isEqual, isNull, isUndefined, keys, sortBy } from "lodash";
import MachineDetailsFieldset, { MachineConnectionProtocolsFormValues } from "../../../molecules/forms/MachineDetailsFieldset/MachineDetailsFieldset";
import MachineConfigFieldset from "../../../molecules/forms/MachineConfigFieldset/MachineConfigFieldset";
import MachineDisksFieldset from "../../../molecules/forms/MachineDisksFieldset/MachineDisksFieldset";
import { useCallback, useEffect, useMemo, useState } from "react";
import AddClientsSelect from "../../../molecules/interactive/AddClientsSelect/AddClientsSelect";
import useApi from "../../../../hooks/useApi";
import { isAxiosError } from "axios";
import MachineNetworkFieldset from "../../../molecules/forms/MachineNetworkFieldset/MachineNetworkFieldset";
import FormControlButtons from "../../../atoms/interactive/FormControlButtons/FormControlButtons";
import { toBytes } from "../../../../utils/files";

export interface MachineEditFormValues {
    title: string;
    tags: string[];
    description: string;
    config: {
        ram: number;
        vcpu: number;
    };
    disks: MachineDiskForm[];
    os_disk: number;
    assigned_clients: string[];
    connection_protocols: MachineConnectionProtocolsFormValues;
    internet_connectivity: boolean;
}

export type MachineEditFormData = MachinePropertiesPayload & {
    ram_max: number | null;
    vcpu: number;
    state: MachineState;
};

export interface MachineEditFormSubmitValues extends Omit<MachineEditFormValues, "os_disk" | "disks" | "connection_protocols"> {
    disks: MachineDisk[];
}
export interface MachineEditFormProps {
    machine: MachineEditFormData;
}

const MachineEditForm = ({ machine }: MachineEditFormProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "machine");
    const { sendRequest } = useApi();
    const { data: loggedInUser, loading, error } = useFetch<UserExtended>("/users/me");
    const { data: users, loading: usersLoading, error: usersError } = useFetch<Record<string, ClientExtended>>("/users/all?account_type=client");
    const { canManageMachine } = usePermissions();
    const [configTemplate, setConfigTemplate] = useState("custom");

    const assignedClientKeys = useMemo(() => _.keys(machine.assigned_clients), [machine.assigned_clients]);

    const connectionKeys = useMemo(() => _.keys(machine.connections), [machine.connections]);

    const diskForms =
        machine.disks?.map?.(
            (disk) =>
                ({
                    name: disk.name,
                    type: disk.type,
                    unit: "MiB",
                    size: disk.size_bytes / (1024 * 1024),
                }) as MachineDiskForm,
        ) ?? [];

    const osDisk = machine.disks?.findIndex((disk) => disk.system) ?? 0;

    const connectionProtocolsString = connectionKeys.sort((a, b) => (a === "ssh" ? 1 : b === "ssh" ? -1 : 0)).join("+") as MachineConnectionProtocolsFormValues;

    const getInitialValues = (): MachineEditFormValues => ({
        title: machine.title ?? "Unnamed Machine",
        tags: machine.tags ?? [],
        description: machine.description?.trim() ?? "",
        config: {
            ram: machine.ram_max ?? 0,
            vcpu: machine.vcpu ?? 1,
        },
        disks: diskForms,
        os_disk: osDisk,
        assigned_clients: assignedClientKeys,
        connection_protocols: connectionProtocolsString,
        internet_connectivity: false, // ! TO BE CHANGED WHEN THE DATA IS AVAILABLE
    });

    const form = useForm<MachineEditFormValues>({
        initialValues: getInitialValues(),
        validateInputOnChange: true,
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
            disks: {
                name: (val) =>
                    /\s/.test(val)
                        ? tns("validation.name-spaces")
                        : !/^[\w.-]+$/.test(val)
                          ? tns("validation.name-invalid-characters")
                          : !/[a-zA-Z]/.test(val[0])
                            ? tns("validation.name-invalid-first")
                            : val.length < 3
                              ? tns("validation.name-too-short")
                              : val.length > 24
                                ? tns("validation.name-too-long")
                                : null,
            },
        },
    });

    const reloadForm = () => {
        form.initialize(getInitialValues());
    };

    const submitChanges = form.onSubmit(async (values) => {
        const { os_disk, disks, connection_protocols, ...otherValues } = values;

        const transformedValues: MachineEditFormSubmitValues = {
            ...otherValues,
            disks: disks.map((disk) => ({
                name: disk.name,
                type: disk.type,
                size_bytes: toBytes(disk.size, disk.unit),
            })),
        };

        const res = await sendRequest("PATCH", `machines/modify/${machine.uuid}`, { data: transformedValues });

        if (isAxiosError(res)) return;

        form.setInitialValues(form.values);
        form.reset();
    });

    useEffect(() => {
        reloadForm();
    }, [machine.state]);

    const addAssignedClient = (newClient: string) => form.setFieldValue("assigned_clients", (prev) => [...prev, newClient]);
    const removeAssignedClient = (uuid: string) => form.setFieldValue("assigned_clients", (prev) => prev.filter((e) => e !== uuid));

    const disabled =
        !machine ||
        loading ||
        !isNull(error) ||
        (loggedInUser && !canManageMachine(loggedInUser, machine as Partial<Machine>)) ||
        !["OFFLINE", "ERROR"].includes(machine.state);

    const assignedClients = useMemo(() => {
        return form.values.assigned_clients.map((uuid) => users?.[uuid]).filter((e): e is ClientExtended => !isUndefined(e));
    }, [form.values.assigned_clients, users]);

    const areValuesChanged = !_.isEqual(form.values, form.getInitialValues());

    return (
        <Stack
            h="100%"
            gap="xs"
        >
            <Tabs
                defaultValue="details"
                className={classes.tabsContainer}
                flex="1"
            >
                <Tabs.List>
                    <Tabs.Tab
                        value="details"
                        leftSection={<IconListDetails size={18} />}
                    >
                        {tns("details")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="resources"
                        leftSection={<IconDeviceDesktopCog size={18} />}
                    >
                        {tns("resources")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="networks"
                        leftSection={<IconTopologyStar3 size={18} />}
                    >
                        {tns("networks")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="disks"
                        leftSection={<IconDeviceFloppy size={18} />}
                    >
                        {tns("disks")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="clients"
                        leftSection={<IconUsers size={18} />}
                    >
                        {tns("assigned-clients")}
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel
                    value="details"
                    className={classes.tabPanel}
                >
                    <MachineDetailsFieldset<MachineEditFormValues>
                        form={form}
                        props={{ fieldset: { variant: "default", className: classes.fieldset } }}
                        // disabled={disabled}
                        disabled={true} // ? readonly for now
                        withoutAssignedClients
                    />
                </Tabs.Panel>
                <Tabs.Panel
                    value="resources"
                    className={classes.tabPanel}
                >
                    <MachineConfigFieldset<MachineEditFormValues>
                        form={form}
                        props={{ fieldset: { variant: "default", className: classes.fieldset }, scrollArea: { maw: "366px" } }}
                        // disabled={disabled}
                        disabled={true} // ? readonly for now
                        setConfigTemplate={setConfigTemplate}
                        configTemplate={configTemplate}
                    />
                </Tabs.Panel>
                <Tabs.Panel
                    value="networks"
                    className={classes.tabPanel}
                >
                    <MachineNetworkFieldset<MachineEditFormValues>
                        form={form}
                        props={{ fieldset: { variant: "default", className: classes.fieldset } }}
                        disabled={disabled}
                    />
                </Tabs.Panel>
                <Tabs.Panel
                    value="disks"
                    className={classes.tabPanel}
                >
                    <MachineDisksFieldset<MachineEditFormValues>
                        form={form}
                        props={{ fieldset: { variant: "default", className: classes.fieldset } }}
                        // disabled={disabled}
                        disabled={true} // ? readonly for now
                        osDiskReadonly={true}
                    />
                </Tabs.Panel>
                <Tabs.Panel
                    value="clients"
                    className={classes.tabPanel}
                >
                    <Fieldset
                        className={classes.fieldset}
                        disabled={disabled}
                    >
                        <Stack h="100%">
                            <Stack
                                pt="xs"
                                gap="42"
                                mih="0"
                                flex="1"
                            >
                                <AddClientsSelect
                                    onSubmit={addAssignedClient}
                                    excludedClients={form.values.assigned_clients}
                                    classNames={{ input: "borderless" }}
                                />

                                <MembersTable
                                    usersData={assignedClients}
                                    removeMember={removeAssignedClient}
                                    error={usersError}
                                    loading={usersLoading}
                                    size="sm"
                                    avatarSize="md"
                                />
                            </Stack>
                        </Stack>
                    </Fieldset>
                </Tabs.Panel>
            </Tabs>
            <FormControlButtons
                onClose={() => form.reset()}
                onSubmit={submitChanges}
                classNames={{
                    close: classes.cancelButton,
                    submit: classes.saveChangesButton,
                }}
                label={{
                    close: t("cancel"),
                    submit: t(areValuesChanged ? "save-changes" : "no-changes"),
                }}
                props={{
                    close: {
                        display: areValuesChanged ? undefined : "none",
                    },
                    submit: {
                        disabled: !areValuesChanged,
                    },
                }}
            />
        </Stack>
    );
};

export default MachineEditForm;
