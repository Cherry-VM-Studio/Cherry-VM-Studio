import { ActionIcon, Fieldset, FieldsetProps, Flex, Group, NumberInput, Paper, ScrollArea, ScrollAreaProps, Select, Stack, TextInput } from "@mantine/core";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";
import { useRef } from "react";
import { UseFormReturnType } from "@mantine/form";
import { MachineDiskForm } from "../../../../types/api.types";
import ListInput from "../../../atoms/interactive/ListInput/ListInput";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import classes from "./MachineDisksFieldset.module.css";
import cs from "classnames";

export interface MachineDisksFormRequiredValues {
    disks: MachineDiskForm[];
    os_disk: number;
}

export interface MachineDisksFormProps<T = {}> {
    form: UseFormReturnType<Omit<T, keyof MachineDisksFormRequiredValues> & MachineDisksFormRequiredValues>;
    disabled?: boolean;
    props?: {
        scrollArea?: Partial<ScrollAreaProps>;
        fieldset?: Partial<FieldsetProps>;
    };
    i18nextNamespace?: string;
    i18nextPrefix?: string;
    osDiskReadonly?: boolean;
}

const MachineDisksFieldset = <T extends Record<string, any> = {}>({
    form,
    disabled = false,
    osDiskReadonly = false,
    i18nextNamespace,
    i18nextPrefix,
    props,
}: MachineDisksFormProps<T>): React.JSX.Element => {
    const newDiskNameRef = useRef(null);
    const { t, tns } = useNamespaceTranslation(i18nextNamespace ?? "pages", i18nextPrefix ?? "machine");

    const createNewDisk = () => {
        //@ts-expect-error
        form.setFieldValue("disks", (prev) => [...(prev as MachineDiskForm[]), { name: "", size: 1, unit: "GiB", type: "raw" } as MachineDiskForm]);
    };

    const removeDisk = (index: number) => {
        form.setFieldValue("disks", (prev) => prev.filter((_, i) => i !== index));
        //@ts-expect-error
        form.setFieldValue("os_disk", (prev) => (prev >= index ? prev - 1 : prev));
    };

    const canRemoveDisk = (index: number) => form.values.disks.length <= 1 || form.values.os_disk === index;

    return (
        <Fieldset
            variant="unstyled"
            {...props?.fieldset}
            className={cs(props?.fieldset?.className, classes.formBorder)}
        >
            <ScrollArea
                h="100%"
                {...props?.scrollArea}
            >
                <Stack>
                    <ListInput
                        disabled={disabled}
                        values={form.values.disks}
                        headerRow={() => (
                            <Group className={classes.headerGroup}>
                                <Flex
                                    w="36"
                                    className={cs(classes.headerText, classes.center)}
                                >
                                    #
                                </Flex>
                                <Flex
                                    w="36"
                                    className={cs(classes.headerText, classes.center)}
                                >
                                    OS
                                </Flex>
                                <Flex
                                    w="216"
                                    className={cs(classes.headerText, classes.left)}
                                >
                                    {tns("drive-name")}
                                </Flex>
                                <Flex
                                    w="164"
                                    className={cs(classes.headerText, classes.left)}
                                >
                                    {tns("drive-size")}
                                </Flex>
                                <Flex
                                    w="80"
                                    className={cs(classes.headerText, classes.left)}
                                >
                                    {tns("drive-type")}
                                </Flex>
                            </Group>
                        )}
                        row={(_, i) => (
                            <>
                                <ActionIcon
                                    variant="default"
                                    size="36px"
                                    color="white"
                                    className="borderless"
                                    //@ts-expect-error
                                    onClick={() => form.setFieldValue("os_disk", i)}
                                    disabled={disabled || osDiskReadonly}
                                >
                                    {form.values.os_disk === i ? <IconCircleCheckFilled /> : <IconCircle />}
                                </ActionIcon>
                                <TextInput
                                    w={220}
                                    ref={form.values.disks.length - 1 === i ? newDiskNameRef : null}
                                    classNames={{ input: "borderless" }}
                                    key={form.key(`disks.${i}.name`)}
                                    error={form.errors[`disks.${i}.name`]}
                                    {...form.getInputProps(`disks.${i}.name`)}
                                    readOnly={disabled || (i === form.values.os_disk && osDiskReadonly)}
                                />
                                <Group
                                    gap="4"
                                    wrap="nowrap"
                                >
                                    <NumberInput
                                        w={80}
                                        decimalScale={3}
                                        min={1}
                                        max={1048576}
                                        hideControls
                                        classNames={{
                                            input: cs("borderless", classes.sizeInputLeft),
                                        }}
                                        key={form.key(`disks.${i}.size`)}
                                        {...form.getInputProps(`disks.${i}.size`)}
                                        readOnly={disabled || (i === form.values.os_disk && osDiskReadonly)}
                                    />
                                    <Select
                                        w={80}
                                        data={["MiB", "GiB"]}
                                        allowDeselect={false}
                                        classNames={{
                                            input: cs("borderless", classes.sizeInputRight),
                                        }}
                                        key={form.key(`disks.${i}.unit`)}
                                        {...form.getInputProps(`disks.${i}.unit`)}
                                        readOnly={disabled || (i === form.values.os_disk && osDiskReadonly)}
                                    />
                                </Group>
                                <Select
                                    w={100}
                                    data={["raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx"]}
                                    key={form.key(`disks.${i}.type`)}
                                    {...form.getInputProps(`disks.${i}.type`)}
                                    classNames={{
                                        input: "borderless",
                                    }}
                                    readOnly={disabled || (i === form.values.os_disk && osDiskReadonly)}
                                    allowDeselect={false}
                                />
                            </>
                        )}
                        createEntry={createNewDisk}
                        removeEntry={removeDisk}
                        canRemoveEntry={canRemoveDisk}
                        h="300px"
                        w="600px"
                    />
                </Stack>
            </ScrollArea>
        </Fieldset>
    );
};

export default MachineDisksFieldset;
