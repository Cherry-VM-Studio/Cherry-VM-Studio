import { Button, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MantineButtonAllProps } from "../../../../types/mantine.types";

interface FormControlButtonsProps {
    onClose: () => void;
    onSubmit: () => void;
    label?: {
        close?: string;
        submit?: string;
    };
    classNames?: {
        close?: string;
        submit?: string;
    };
    props?: {
        close?: MantineButtonAllProps;
        submit?: MantineButtonAllProps;
    };
}

const FormControlButtons = ({ label, onClose, onSubmit, classNames, props = {} }: FormControlButtonsProps): React.JSX.Element => {
    const { t } = useTranslation();

    return (
        <Group
            mt="lg"
            justify="center"
        >
            <Button
                className={classNames?.close}
                onClick={onClose}
                {...props?.close}
            >
                {label?.close || t("close")}
            </Button>
            <Button
                variant="white"
                className={classNames?.submit}
                onClick={onSubmit}
                {...props?.submit}
            >
                {label?.submit || t("submit")}
            </Button>
        </Group>
    );
};

export default FormControlButtons;
