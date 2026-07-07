import { Checkbox, CheckboxProps, Fieldset, FieldsetProps, ScrollArea, ScrollAreaProps, Stack, Text } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";

export interface MachineNetworkFieldsetRequiredValues {
    internet_connectivity: boolean;
}

export interface MachineNetworkFieldsetProps<T = {}> {
    form: UseFormReturnType<MachineNetworkFieldsetRequiredValues & T>;
    disabled?: boolean;
    props?: {
        scrollArea?: Partial<ScrollAreaProps>;
        fieldset?: Partial<FieldsetProps>;
        internetCheckbox?: Partial<CheckboxProps>;
    };
    i18nextNamespace?: string;
    i18nextPrefix?: string;
}

const MachineNetworkFieldset = <T extends Record<string, any> = {}>({
    form,
    disabled,
    props,
    i18nextNamespace,
    i18nextPrefix,
}: MachineNetworkFieldsetProps<T>): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation(i18nextNamespace ?? "pages", i18nextPrefix ?? "machine");

    return (
        <Fieldset
            variant="unstyled"
            {...props?.fieldset}
        >
            <ScrollArea
                h="100%"
                {...props?.scrollArea}
            >
                <Stack
                    style={{ overflow: "hidden" }}
                    gap="xs"
                    pb="md"
                >
                    <Text
                        fw="600"
                        fz="sm"
                    >
                        {tns("internet-connectivity")}
                    </Text>
                    <Checkbox
                        label={tns("internet-connectivity-label")}
                        disabled={disabled}
                        {...form.getInputProps("internet_connectivity")}
                        {...props?.internetCheckbox}
                    />
                </Stack>
            </ScrollArea>
        </Fieldset>
    );
};

export default MachineNetworkFieldset;
