import { Loader, TextInput, TextInputProps } from "@mantine/core";
import { useField } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCheck, IconX } from "@tabler/icons-react";
import { ReactNode, useEffect, useState } from "react";

export type DebouncedTextInputProps = Omit<TextInputProps, "onChange"> & {
    initialValue: string;
    validate: (val: string) => ReactNode | Promise<ReactNode> | undefined;
    onChange: (val: string) => void;
    resetTrigger: string | number | null;
    delay?: number;
};

const DebouncedTextInput = ({ initialValue, validate, onChange, resetTrigger, delay = 1000, ...props }: DebouncedTextInputProps): React.JSX.Element => {
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(false);

    const field = useField({
        validateOnChange: false,
        initialValue,
        validate,
    });

    const debouncedOnChange = useDebouncedCallback(async (value: string) => {
        const original = initialValue;

        if (value === original) return;

        const error = await field.validate();

        setLoading(false);

        if (error) {
            field.setError(error);
            return;
        }

        onChange(value);
        setChanged(true);
    }, delay);

    useEffect(() => {
        field.setValue(initialValue);
        setChanged(false);
        setLoading(false);
    }, [resetTrigger]);

    return (
        <TextInput
            {...field.getInputProps()}
            onChange={(e) => {
                setLoading(true);
                field.getInputProps().onChange?.(e);
                debouncedOnChange(e.currentTarget.value);
            }}
            rightSection={
                field.error ? (
                    <IconX
                        size={20}
                        color="var(--mantine-color-cherry-6)"
                    />
                ) : loading ? (
                    <Loader
                        size={16}
                        color="dark.2"
                    />
                ) : changed ? (
                    <IconCheck
                        size={20}
                        color="var(--mantine-color-lime-6)"
                    />
                ) : (
                    <></>
                )
            }
            {...props}
        />
    );
};

export default DebouncedTextInput;
