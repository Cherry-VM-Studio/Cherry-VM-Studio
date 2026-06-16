import { Button, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";

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
}

const FormControlButtons = ({ label, onClose, onSubmit, classNames }: FormControlButtonsProps): React.JSX.Element => {
    const { t } = useTranslation();

    return (
        <Group
            mt="lg"
            justify="center"
        >
            <Button
                className={classNames?.close}
                onClick={onClose}
            >
                {label?.close || t("close")}
            </Button>
            <Button
                variant="white"
                className={classNames?.submit}
                onClick={onSubmit}
            >
                {label?.submit || t("submit")}
            </Button>
        </Group>
    );
};

export default FormControlButtons;
