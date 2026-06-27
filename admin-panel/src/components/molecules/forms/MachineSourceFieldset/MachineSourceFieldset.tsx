import {
    Button,
    Fieldset,
    FieldsetProps,
    Group,
    Radio,
    RadioGroupProps,
    RadioProps,
    ScrollArea,
    ScrollAreaProps,
    Select,
    SelectProps,
    Stack,
} from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { UseFormReturnType } from "@mantine/form";
import useFetch from "../../../../hooks/useFetch";
import { entries, merge } from "lodash";
import { IsoFile } from "../../../../types/api.types";

export interface MachineSourceFormRequiredValues {
    source_uuid: string;
    source_type: "iso" | "snapshot";
}

export interface MachineSourceFormProps<T = {}> {
    form: UseFormReturnType<MachineSourceFormRequiredValues & T>;
    disabled?: boolean;
    props?: {
        scrollArea?: Partial<ScrollAreaProps>;
        fieldset?: Partial<FieldsetProps>;
        radioGroup?: Partial<RadioGroupProps>;
        radio?: Partial<RadioProps>;
        sourceSelect: Partial<SelectProps>;
    };
    i18nextNamespace?: string;
    i18nextPrefix?: string;
}

const MachineSourceFieldset = <T extends Record<string, any> = {}>({
    form,
    disabled,
    props,
    i18nextNamespace,
    i18nextPrefix,
}: MachineSourceFormProps<T>): React.JSX.Element => {
    const { data: isoFiles } = useFetch<Record<string, IsoFile>>("/iso/all");
    const { t, tns } = useNamespaceTranslation(i18nextNamespace ?? "modals", i18nextPrefix ?? "create-machine");

    const isoSelectData = entries(isoFiles).map(([uuid, isoRecord]: [string, IsoFile]) => ({
        value: uuid,
        label: isoRecord.name,
    }));

    const snapshotSelectData = [];

    return (
        <Fieldset
            variant="unstyled"
            disabled={disabled}
            {...props?.fieldset}
        >
            <ScrollArea
                h="100%"
                {...props?.scrollArea}
            >
                <Stack>
                    <Radio.Group
                        label={tns("source-type")}
                        description={tns("source-type-description")}
                        key={form.key("source_type")}
                        {...form.getInputProps("source_type")}
                        {...props?.radioGroup}
                    >
                        <Group mt="xs">
                            <Radio
                                value="iso"
                                label={tns("iso-file")}
                                {...props?.radio}
                            />
                            <Radio
                                value="snapshot"
                                label={tns("machine-snapshot")}
                                {...props?.radio}
                            />
                        </Group>
                    </Radio.Group>
                    <Select
                        label={tns(`select-${form.values.source_type}`)}
                        placeholder={tns("none-selected")}
                        data={form.values.source_type === "iso" ? isoSelectData : snapshotSelectData}
                        key={form.key("source_uuid")}
                        {...form.getInputProps("source_uuid")}
                        {...props?.sourceSelect}
                        classNames={merge({ input: "borderless" }, props?.sourceSelect?.classNames)}
                    />
                </Stack>
            </ScrollArea>
        </Fieldset>
    );
};

export default MachineSourceFieldset;
