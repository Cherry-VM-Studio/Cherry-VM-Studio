import { Box, Button, Group, Paper, ScrollArea, Stack } from "@mantine/core";
import SpreadsheetImportTable from "../../tables/SpreadsheetImportTable/SpreadsheetImportTable";
import { IconCheck, IconChevronLeft, IconDownload } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import classes from "./VerifySpreadsheetForm.module.css";
import { useEffect, useMemo, useState } from "react";
import useFetch from "../../../../hooks/useFetch";
import { UserExtended } from "../../../../types/api.types";
import _, { isString, isUndefined, keys } from "lodash";
import { useThrottledCallback } from "@mantine/hooks";
import AccountImportValidationError from "../../../molecules/feedback/AccountImportValidationError/AccountImportValidationError";
import Papa from "papaparse";

export type AutofixFunction = (val: string | undefined, target: Record<string, string>, values: string[], ...props: any[]) => string;
export interface Validator {
    key: string;
    message: string;
    autofixMessage?: string;
    validate: (val: string | undefined, target: Record<string, string>, values: string[]) => boolean;
    autofix?: AutofixFunction;
}

export type ValidationConfig = Record<string, Validator[]>;

// <Property Name, <Error Id, Rows Affected>>
export type ValidationErrors = Record<string, Record<string, number[]>>;
export interface VerifySpreadsheetForm {
    onSubmit?: () => void;
    onCancel?: () => void;
    properties: string[];
    data: Record<string, string>[];
    setData: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
    validationConfig: ValidationConfig;
}

const VerifySpreadsheetForm = ({ properties, data, setData, onSubmit, onCancel, validationConfig }: VerifySpreadsheetForm): React.JSX.Element => {
    const getEmptyErrors = () => _.mapValues(validationConfig, (validators) => _.fromPairs(validators.map((v) => [v.key, []])));

    const [firstLoad, setFirstLoad] = useState(true);
    const { t } = useTranslation();
    const { data: users, loading, error } = useFetch<UserExtended>("/users/all");
    const [errors, setErrors] = useState<ValidationErrors>(getEmptyErrors());
    const [currentFocusedRow, setCurrentFocusedRow] = useState(0);

    const duplicates = useMemo(
        () => ({
            username: [
                ..._.map(data, "username").filter((e) => !isUndefined(e)),
                ..._.values(users)
                    .map((e) => e.username)
                    .filter((e) => isString(e)),
            ],
            email: [
                ..._.map(data, "email").filter((e) => !isUndefined(e)),
                ..._.values(users)
                    .map((e) => e.email)
                    .filter((e) => isString(e)),
            ],
        }),
        [data, users],
    );

    const rowErrors = useMemo(
        () =>
            _.flatMap(errors, (inner, property) =>
                _.flatMap(inner, (rows, key) => _.flatMap(rows, (row) => ({ row, message: validationConfig[property].find((e) => e.key === key).message }))),
            ),

        [errors],
    );

    const downloadCurrent = () => {
        const csv = Papa.unparse(data);

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").split("Z")[0];

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `users-import-${timestamp}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // mutates by reference
    const runValidators = (property: string, record: Record<string, string>, rowIndex: number, validators: Validator[], target: ValidationErrors) => {
        for (const validator of validators) {
            if (!validator.validate(record?.[property], record, duplicates?.[property] || [])) continue;
            target[property][validator.key].push(rowIndex);
        }
    };

    const calculateErrorsInRow = (index: number, prev: ValidationErrors) => {
        if (!data || index >= data.length) return;

        const record = data[index];
        const newErrors = _.mapValues(prev, (o) => _.mapValues(o, (rows) => _.without(rows, index)));

        _.entries(validationConfig).forEach(([property, validators]) => runValidators(property, record, index, validators, newErrors));

        return newErrors;
    };

    const calculateErrorsInColumn = (property: string, prev: ValidationErrors) => {
        if (!data || isUndefined(validationConfig[property])) return;

        const validators = validationConfig[property];
        const newErrors: ValidationErrors = { ...prev, [property]: _.fromPairs(validators.map((v) => [v.key, [] as number[]])) };

        data.forEach((record, i) => runValidators(property, record, i, validators, newErrors));

        return newErrors;
    };

    const calculateErrors = () => {
        const newErrors = getEmptyErrors();

        data.forEach((record, i) => {
            _.entries(validationConfig).forEach(([property, validators]) => runValidators(property, record, i, validators, newErrors));
        });

        return newErrors;
    };

    const updateErrorsInRow = useThrottledCallback((index: number) => setErrors((prev) => calculateErrorsInRow(index, prev)), 1000);

    const updateErrorsInColumn = useThrottledCallback((property: string) => setErrors((prev) => calculateErrorsInColumn(property, prev)), 1000);

    const updateErrors = useThrottledCallback(() => setErrors(calculateErrors()), 1000);

    const updateCell = (row: number, property: string, value: string) => {
        setData((prev) => {
            const newData = [...prev];
            newData[row][property] = value;
            return newData;
        });

        updateErrorsInRow(row);
    };

    const autofix = (rowNumbers: number[], property: string, callback: AutofixFunction) => {
        const additionalDuplicates = {
            username: [],
            email: [],
        };

        setFirstLoad(true);
        setData((prev) => {
            const newData = [...prev];

            rowNumbers.forEach((rowNumber) => {
                const record = newData?.[rowNumber];

                if (!record) return;

                record[property] = callback(record?.[property], record, [...(duplicates?.[property] || []), ...(additionalDuplicates?.[property] || [])]);

                if (!(property in additionalDuplicates)) return;

                additionalDuplicates[property].push(record[property]);
            });

            return newData;
        });
    };

    useEffect(() => {
        if (_.isEmpty(errors) || _.isUndefined(currentFocusedRow)) return;

        if (currentFocusedRow >= data.length) {
            setCurrentFocusedRow(0);
            return;
        }

        const id = `spreadsheet-table-row-${currentFocusedRow}`;

        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [currentFocusedRow]);

    useEffect(() => {
        if (data && firstLoad) {
            setFirstLoad(false);
            updateErrors();
        }
    }, [data, firstLoad]);

    useEffect(() => {
        keys(duplicates).forEach((property) => updateErrorsInColumn(property));
    }, [duplicates]);

    const displayedErrors = _.flatMap(_.entries(errors || {}), ([property, error]) =>
        _.flatMap(_.entries(error || {}), ([key, rows]) => {
            const validator = validationConfig[property].find((e) => e.key === key);

            return rows?.length ? (
                <AccountImportValidationError
                    key={`${key}-${property}`}
                    currentFocusedRow={currentFocusedRow}
                    setCurrentFocusedRow={setCurrentFocusedRow}
                    property={property}
                    rows={rows}
                    validator={validator}
                    onAutofix={autofix}
                />
            ) : undefined;
        }),
    );

    return (
        <Stack h="100%">
            <Group className={classes.contentGroup}>
                <SpreadsheetImportTable
                    records={data}
                    headers={properties}
                    setCellData={updateCell}
                    rowErrors={rowErrors}
                />
                <Paper className={classes.outputPaper}>
                    <ScrollArea
                        h="100%"
                        scrollbarSize="0.625rem"
                    >
                        <Stack className={classes.errorsStack}>{displayedErrors}</Stack>
                    </ScrollArea>
                </Paper>
            </Group>
            <Group
                justify="space-between"
                mt="auto"
            >
                <Button
                    w="150"
                    variant="default"
                    className="borderless"
                    classNames={{ label: classes.nextButtonLabel }}
                    onClick={downloadCurrent}
                >
                    <Group
                        gap="6"
                        ml="-12px"
                    >
                        <IconDownload
                            size={16}
                            stroke={3}
                        />
                        {t("download")}
                    </Group>
                </Button>
                <Group justify="center">
                    <Button
                        w="150"
                        variant="default"
                        className="borderless"
                        fw="600"
                        classNames={{ label: classes.nextButtonLabel }}
                        onClick={onCancel}
                    >
                        {t("go-back")}
                    </Button>
                    <Button
                        w="200px"
                        variant="white"
                        classNames={{ label: classes.nextButtonLabel }}
                        onClick={() => onSubmit?.()}
                        disabled={!_.isNull(error) || loading || rowErrors.length > 0}
                    >
                        {t("submit-and-create")}
                    </Button>
                </Group>
                <Box w="150" />
            </Group>
        </Stack>
    );
};

export default VerifySpreadsheetForm;
