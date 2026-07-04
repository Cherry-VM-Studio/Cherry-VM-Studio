import { Button, Group, Loader, Modal, Stack, TextInput, TextInputProps } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useField } from "@mantine/form";

export interface TextFieldModalProps {
    opened: boolean;
    title: string;
    children?: React.JSX.Element;
    inputProps?: TextInputProps | null;
    initialValue?: string;
    error?: string;
    onValidate?: (val: string) => string | null;
    onConfirm: (val: string) => any;
    onCancel: () => any;
}

const TextFieldModal = (p: TextFieldModalProps): React.JSX.Element => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState<boolean>(false);

    const field = useField({
        initialValue: p.initialValue || "",
        validate: p.onValidate,
    });

    const onConfirm = async () => {
        setLoading(true);

        const validation = await field.validate();

        if (!validation) {
            p.onConfirm(field.getValue());
            field.reset();
        } else field.setError(validation);

        setLoading(false);
    };

    const onCancel = () => {
        field.reset();
        setLoading(false);
        p.onCancel();
    };

    useEffect(() => {
        if (p.opened) {
            field.setValue(p.initialValue ?? "");
            field.setError(null);
        }
    }, [p.opened, p.initialValue]);

    return (
        <Modal
            opened={p.opened}
            onClose={onCancel}
            title={p.title}
        >
            <Stack>
                {p.children}
                <TextInput
                    {...field.getInputProps()}
                    {...p.inputProps}
                    rightSection={loading ? <Loader size={18} /> : null}
                    classNames={{ input: "borderless" }}
                />

                <Group justify="center">
                    <Button
                        type="submit"
                        variant="light"
                        flex="1"
                        data-autofocus
                        color="gray"
                        onClick={onCancel}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="submit"
                        variant="white"
                        data-autofocus
                        onClick={onConfirm}
                        flex="1"
                    >
                        {t("confirm")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export default TextFieldModal;
