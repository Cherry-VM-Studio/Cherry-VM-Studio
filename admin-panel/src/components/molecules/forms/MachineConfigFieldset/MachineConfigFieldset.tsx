import { Divider, Fieldset, FieldsetProps, ScrollArea, ScrollAreaProps, Select, SelectProps, Stack, Text } from "@mantine/core";
import { isNull, values } from "lodash";
import React from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import EnhancedSlider, { EnhancedSliderProps } from "../../../atoms/interactive/EnhancedSlider/EnhancedSlider";
import { UseFormReturnType } from "@mantine/form";
import useFetch from "../../../../hooks/useFetch";
import { MachineTemplate } from "../../../../types/api.types";

export interface MachineConfigFormRequiredValues {
    config: {
        ram: number;
        vcpu: number;
    };
}

export interface MachineConfigFormProps<T = {}> {
    form: UseFormReturnType<MachineConfigFormRequiredValues & T>;
    disabled?: boolean;
    props?: {
        scrollArea?: Partial<ScrollAreaProps>;
        fieldset?: Partial<FieldsetProps>;
        templateSelect?: Partial<SelectProps>;
        sliderRam?: Partial<EnhancedSliderProps>;
        sliderCpu?: Partial<EnhancedSliderProps>;
    };
    configTemplate: string;
    setConfigTemplate: (callback: ((prev: string) => string) | string) => void;
    i18nextNamespace?: string;
    i18nextPrefix?: string;
}

const MachineConfigFieldset = <T extends Record<string, any> = {}>({
    disabled,
    form,
    configTemplate,
    setConfigTemplate,
    props,
    i18nextNamespace,
    i18nextPrefix,
}: MachineConfigFormProps<T>): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation(i18nextNamespace ?? "pages", i18nextPrefix ?? "machine");
    const { data: templates, error, loading } = useFetch<Record<string, MachineTemplate>>("/machine-templates/all");

    const onTemplateChange = (value: string | null) => {
        setConfigTemplate(value);

        if (value === "custom") return;

        form.setFieldValue("config", (prev) => ({
            ...prev,
            ram: templates[value].ram,
            vcpu: templates[value].vcpu,
        }));
    };

    const templateSelectData = [
        {
            group: t("auto"),
            items: [{ value: "custom", label: t("custom") }],
        },
        {
            group: t("templates"),
            items: values(templates).map((template) => ({ value: template.uuid, label: template.name })),
        },
    ];

    return (
        <Fieldset
            variant="unstyled"
            {...props?.fieldset}
        >
            <ScrollArea
                h="100%"
                {...props?.scrollArea}
            >
                <Stack style={{ overflow: "hidden" }}>
                    <Select
                        description={tns("config-template")}
                        placeholder={isNull(configTemplate) ? tns("none-selected") : ""}
                        classNames={{ input: "borderless" }}
                        data={templateSelectData}
                        value={configTemplate}
                        onChange={onTemplateChange}
                        allowDeselect={false}
                        {...props?.templateSelect}
                        readOnly={disabled}
                    />
                    <Divider />
                    <Text fw="500">{t("configuration")}</Text>
                    <EnhancedSlider
                        heading={tns("ram")}
                        label={(val) => tns("ram-unit", { count: val })}
                        w="100%"
                        size="sm"
                        color="cyan.7"
                        thumbSize="12"
                        max={6144}
                        step={512}
                        styles={{ thumb: { border: "none" } }}
                        key={form.key("config.ram")}
                        disabled={disabled}
                        {...form.getInputProps("config.ram")}
                        {...props?.sliderRam}
                    />

                    <EnhancedSlider
                        heading={tns("vcpu")}
                        label={(val) => tns("vcpu-unit", { count: val })}
                        w="100%"
                        size="sm"
                        color="pink.7"
                        thumbSize="12"
                        min={1}
                        max={8}
                        styles={{ thumb: { border: "none" } }}
                        key={form.key("config.vcpu")}
                        disabled={disabled}
                        {...form.getInputProps("config.vcpu")}
                        {...props?.sliderCpu}
                    />
                </Stack>
            </ScrollArea>
        </Fieldset>
    );
};

export default MachineConfigFieldset;
