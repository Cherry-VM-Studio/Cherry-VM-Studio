import { ActionIcon, Button, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconArrowBarToUp, IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { isUndefined } from "lodash";
import { AutofixFunction, Validator } from "../../../organisms/forms/VerifySpreadsheetForm/VerifySpreadsheetForm";
import { findFirstGreaterThan, findFirstLessThan } from "../../../../utils/arrays";
import classes from "./AccountImportValidationError.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { t } from "i18next";

export interface AccountImportValidationErrorProps {
    validator: Validator;
    property: string;
    rows: number[];
    currentFocusedRow: number;
    setCurrentFocusedRow: React.Dispatch<React.SetStateAction<number>>;
    onAutofix: (rowNumbers: number[], property: string, callback: AutofixFunction) => void;
}

const AccountImportValidationError = ({
    onAutofix,
    property,
    validator,
    rows,
    currentFocusedRow,
    setCurrentFocusedRow,
}: AccountImportValidationErrorProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("modals", "import-accounts.validation");

    return (
        <Group className={classes.container}>
            <Stack className={classes.textContainer}>
                <Text className={classes.topText}>
                    <b>{`${property}: `}</b>
                    {`${tns(`${property}.${validator.key}.message`)}`}
                </Text>
                <Text className={classes.bottomText}>
                    {tns("affected-rows", {
                        count: rows.length,
                        rows: `${rows
                            .slice(0, 10)
                            .map((e) => e + 1)
                            .join(", ")}
                            ${rows.length > 10 ? ", ..." : ""}`,
                    })}
                </Text>
            </Stack>
            <Group gap="8">
                <ActionIcon
                    variant="default"
                    size="lg"
                    onClick={() => setCurrentFocusedRow(rows[0])}
                >
                    <IconArrowBarToUp />
                </ActionIcon>
                <ActionIcon
                    variant="default"
                    size="lg"
                    onClick={() => setCurrentFocusedRow((prev) => findFirstLessThan(rows, prev) ?? 0)}
                >
                    <IconArrowUp />
                </ActionIcon>
                <ActionIcon
                    variant="default"
                    size="lg"
                    onClick={() => setCurrentFocusedRow((prev) => findFirstGreaterThan(rows, prev) ?? 0)}
                >
                    <IconArrowDown />
                </ActionIcon>

                <Tooltip label={tns(`${property}.${validator.key}.autofixMessage`) ?? ""}>
                    <Button
                        variant="default"
                        classNames={{ label: classes.nextButtonLabel }}
                        onClick={() => onAutofix(rows, property, validator.autofix)}
                    >
                        {t("autofix")}
                    </Button>
                </Tooltip>
            </Group>
        </Group>
    );
};

export default AccountImportValidationError;
