import { Button } from "@mantine/core";
import classes from './ApplyButton.module.css';
import { useTranslation } from "react-i18next";
import { ApplyButtonProps } from "../../../../types/components.types";

const ApplyButton = ({onClick, isDirty = null, ...props} : ApplyButtonProps) => {
    const { t } = useTranslation();

    return (
        <Button
            onClick={onClick}
            disabled={!isDirty}
            classNames={{
                root: isDirty === null ? null : classes.saveButton,
            }}
            variant='default'
            // w={isDirty ? 100 : 200}
            p={0}
            {...props}
        >
            {t(isDirty === null ? 'no-changes' : isDirty ? 'save' : 'changes-saved')}
        </Button>
    )
}

export default ApplyButton;