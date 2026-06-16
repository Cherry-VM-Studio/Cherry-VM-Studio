import { Button, Fieldset, Stack, Tabs } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { IconCheck, IconDeviceDesktopCog, IconDeviceFloppy, IconListDetails, IconUsers } from "@tabler/icons-react";
import { ClientExtended, Machine, MachineDiskForm, UserExtended } from "../../../../types/api.types";
import { useForm } from "@mantine/form";
import MembersTable from "../../tables/MembersTable/MembersTable";
import useFetch from "../../../../hooks/useFetch";
import classes from "./MachineEditForm.module.css";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { isEqual, isNull, isUndefined, keys, sortBy } from "lodash";
import MachineDetailsFieldset, { MachineConnectionProtocolsFormValues } from "../../../molecules/forms/MachineDetailsFieldset/MachineDetailsFieldset";
import MachineConfigFieldset from "../../../molecules/forms/MachineConfigFieldset/MachineConfigFieldset";
import MachineDisksFieldset from "../../../molecules/forms/MachineDisksFieldset/MachineDisksFieldset";
import { useEffect, useMemo, useState } from "react";
import AddClientsSelect from "../../../molecules/interactive/AddClientsSelect/AddClientsSelect";
import useApi from "../../../../hooks/useApi";
import { isAxiosError } from "axios";

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
}

export interface MachineEditFormProps {
    machine: Machine;
}

const MachineEditForm = ({ machine }: MachineEditFormProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "machine");
    const { sendRequest } = useApi();
    const { data: loggedInUser, loading, error } = useFetch<UserExtended>("/users/me");
    const { data: users, loading: usersLoading, error: usersError } = useFetch<Record<string, ClientExtended>>("/users/all?account_type=client");
    const { canManageMachine } = usePermissions();
    const [configTemplate, setConfigTemplate] = useState("custom");

    const getInitialValues = (): MachineEditFormValues => ({
        title: machine.title ?? "Unnamed Machine",
        tags: machine?.tags ?? [],
        description: machine.description?.trim(),
        config: {
            ram: machine.ram_max,
            vcpu: machine.vcpu,
        },
        disks:
            machine.disks?.map?.(
                (disk) =>
                    ({
                        name: disk.name,
                        type: disk.type,
                        unit: "MiB",
                        size: disk.size_bytes / (1024 * 1024),
                    }) as MachineDiskForm,
            ) ?? [],
        os_disk: 0,
        assigned_clients: keys(machine.assigned_clients),
        connection_protocols: keys(machine.connections)
            .sort((a, b) => (a === "ssh" ? 1 : b === "ssh" ? -1 : 0))
            .join("+") as MachineConnectionProtocolsFormValues,
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
        form.setInitialValues(getInitialValues());
        form.reset();
    };

    const submitChanges = async () => {
        const res = await sendRequest("PATCH", `machines/modify/${machine.uuid}`, { data: { assigned_clients: form.values.assigned_clients } });

        if (isAxiosError(res)) return;

        form.setInitialValues(form.values);
        form.reset();
    };

    useEffect(() => {
        reloadForm();
    }, [machine.state]);

    const addAssignedClient = (newClient: string) => form.setFieldValue("assigned_clients", (prev) => [...prev, newClient]);
    const removeAssignedClient = (uuid: string) => form.setFieldValue("assigned_clients", (prev) => prev.filter((e) => e !== uuid));

    const disabled = !machine || loading || !isNull(error) || !canManageMachine(loggedInUser, machine) || !["OFFLINE", "ERROR"].includes(machine.state);

    const assignedClients = form.values.assigned_clients.map((uuid) => users?.[uuid]).filter((e) => !isUndefined(e));
    const assignedClientsChanged = !isEqual(sortBy(form.values.assigned_clients), sortBy(form.getInitialValues().assigned_clients));

    return (
        <Tabs
            defaultValue="details"
            className={classes.tabsContainer}
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
                                error={error}
                                loading={loading}
                            />
                        </Stack>
                        <Button
                            variant="light"
                            m="auto"
                            color="lime"
                            leftSection={
                                <IconCheck
                                    size={18}
                                    stroke={3}
                                />
                            }
                            disabled={!assignedClientsChanged}
                            onClick={submitChanges}
                            h="36"
                        >
                            {t(assignedClientsChanged ? "save-changes" : "no-changes")}
                        </Button>
                    </Stack>
                </Fieldset>
            </Tabs.Panel>
        </Tabs>
    );
};

export default MachineEditForm;
