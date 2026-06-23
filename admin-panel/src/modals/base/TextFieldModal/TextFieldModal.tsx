import { Button, Loader, Modal, Stack, TextInput, TextInputProps } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useField } from "@mantine/form";

export interface TextFieldModalProps {
    opened: boolean;
    title: string;
    children: React.JSX.Element;
    inputProps?: TextInputProps | null;
    initialValue?: string;
    error?: string;
    onValidate?: (val: string) => boolean | null;
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

    const onConfirm = () => {
        setLoading(true);
        field
            .validate()
            .then((invalid) => !invalid && p.onConfirm(field.getValue()))
            .then(() => {
                setLoading(false);
                field.reset();
            });
    };

    const onCancel = () => {
        field.reset();
        setLoading(false);
        p.onCancel();
    };

    useEffect(() => {
        field.setError(p.error);
    }, [p.error]);

    return (
        <Modal
            opened={p.opened}
            onClose={onCancel}
            title={p.title}
        >
            <Stack>
                {p.children}
                <TextInput
                    {...p.inputProps}
                    {...field.getInputProps()}
                    rightSection={loading ? <Loader size={18} /> : null}
                />
                <Button
                    type="submit"
                    variant="light"
                    radius="sm"
                    data-autofocus
                    onClick={onConfirm}
                >
                    {t("confirm")}
                </Button>
            </Stack>
        </Modal>
    );
};

export default TextFieldModal;
