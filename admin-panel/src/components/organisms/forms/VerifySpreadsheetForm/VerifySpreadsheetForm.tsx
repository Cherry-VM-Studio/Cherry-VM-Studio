import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import SpreadsheetImportTable, { RowError } from "../../tables/SpreadsheetImportTable/SpreadsheetImportTable";
import { IconCheck, IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import classes from "./VerifySpreadsheetForm.module.css";
import { useEffect, useMemo, useState } from "react";
import { ParseError } from "papaparse";
import useFetch from "../../../../hooks/useFetch";
import { UserExtended } from "../../../../types/api.types";
import _, { isString, isUndefined, keyBy, keys } from "lodash";
import { useThrottledCallback } from "@mantine/hooks";

interface Validator {
    key: string;
    message: string;
    autofixMessage?: string;
    validate: (val: string | undefined, target: Record<string, string>, values: string[]) => boolean;
    autofix?: (val: string | undefined, target: Record<string, string>, values: string[]) => string;
}

export type ValidationConfig = Record<string, Validator[]>;

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

    const { t } = useTranslation();
    const { data: users, loading, error } = useFetch<UserExtended>("/users/all");
    const [errors, setErrors] = useState<Record<string, Record<string, number[]>>>(getEmptyErrors());

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

    console.log(duplicates);

    const rowErrors = useMemo(() => _.uniq(_.flatMap(errors, (inner) => _.flatMap(inner, (arr) => arr))).map((row) => ({ row })), [errors]);

    const calculateErrors = useThrottledCallback(() => {
        const newErrors = getEmptyErrors();

        data.forEach((record, i) => {
            _.entries(validationConfig).forEach(([property, validators]) =>
                validators.forEach((validator) => {
                    if (!validator.validate(record?.[property], record, duplicates?.[property])) return;

                    newErrors[property][validator.key].push(i);
                }),
            );
        });

        setErrors(newErrors);
    }, 1000);

    const updateCell = (row: number, property: string, value: string) => {
        setData((prev) => {
            const newData = [...prev];
            newData[row][property] = value;
            return newData;
        });
    };

    useEffect(() => {
        calculateErrors();
    }, [data, duplicates]);

    const displayedErrors = _.flatMap(_.entries(errors || {}), ([property, error]) =>
        _.flatMap(_.entries(error || {}), ([key, rows]) =>
            rows?.length ? (
                <Group>
                    <Text>{`[${property}]: ${validationConfig[property].find((e) => e.key === key).message} - ${rows.length} rows affected.`}</Text>
                </Group>
            ) : undefined,
        ),
    );

    return (
        <Stack h="100%">
            <Group
                w="100%"
                mih="0"
                flex="1"
            >
                <SpreadsheetImportTable
                    records={data}
                    headers={properties}
                    setCellData={updateCell}
                    rowErrors={rowErrors}
                />
                <Paper
                    className={classes.outputPaper}
                    flex="0.75"
                    h="100%"
                >
                    {...displayedErrors}
                </Paper>
            </Group>
            <Group
                justify="center"
                mt="auto"
            >
                <Button
                    w="150"
                    variant="default"
                    className="borderless"
                    fw="600"
                    classNames={{ label: classes.nextButtonLabel }}
                    onClick={onCancel}
                >
                    <Group
                        gap="6"
                        ml="-12px"
                    >
                        <IconChevronLeft
                            size={14}
                            stroke={5}
                        />
                        Go back
                    </Group>
                </Button>
                <Button
                    w="150px"
                    variant="white"
                    classNames={{ label: classes.nextButtonLabel }}
                    onClick={() => onSubmit?.()}
                >
                    <Group
                        gap="6"
                        ml="12px"
                    >
                        {t("submit")}
                        <IconCheck
                            size={14}
                            stroke={5}
                        />
                    </Group>
                </Button>
            </Group>
        </Stack>
    );
};

export default VerifySpreadsheetForm;
