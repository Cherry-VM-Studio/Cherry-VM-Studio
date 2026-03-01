import { Button, Checkbox, Group, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import { isEmpty, isNull, merge } from "lodash";
import Papa, { ParseConfig, ParseError, ParseMeta, ParseResult } from "papaparse";
import { useEffect, useState } from "react";
import { decodeCharacters, encodeCharacters } from "../../../../utils/chars";
import { IconChevronLeft, IconChevronRight, IconEraser, IconRepeat } from "@tabler/icons-react";
import SpreadsheetImportTable from "../../tables/SpreadsheetImportTable/SpreadsheetImportTable";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import classes from "./ParseSpreadsheetForm.module.css";

export type ParsedData = Array<Record<string, string> | Array<string>>;

export interface ParseSpreadsheetFormProps {
    file: File | null;
    onSubmit?: (data: ParsedData, headers: string[] | null) => void;
    onCancel?: () => void;
    resetTrigger: boolean;
}

const ParseSpreadsheetForm = ({ file, onCancel, onSubmit, resetTrigger }: ParseSpreadsheetFormProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "account");

    const defaultOptions = {
        delimiter: "",
        quoteChar: '"',
        escapeChar: '"',
        header: true,
    };

    const [data, setData] = useState<ParsedData>(null);
    const [headers, setHeaders] = useState<string[]>(null);
    const [options, setOptions] = useState<ParseConfig>(defaultOptions);
    const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
    const [criticalError, setCriticalError] = useState<ParseError>(null);
    const [currentFocusedError, setCurrentFocusedError] = useState(0);

    useEffect(() => {
        parseFile();
    }, [file]);

    useEffect(() => {
        resetStates();
    }, [resetTrigger]);

    useEffect(() => {
        if (isEmpty(parseErrors)) return;

        if (currentFocusedError >= parseErrors.length) {
            setCurrentFocusedError(0);
            return;
        }

        const row = parseErrors[currentFocusedError].row;
        const id = `spreadsheet-table-row-${row}`;

        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [currentFocusedError, parseErrors]);

    const resetStates = () => {
        setData(null);
        setHeaders(null);
        setOptions(defaultOptions);
        setParseErrors([]);
        setCriticalError(null);
        setCurrentFocusedError(0);
    };

    const cancel = () => {
        resetStates();
        onCancel?.();
    };

    const combineOptions = ({ delimiter, linebreak }: ParseMeta) => {
        setOptions((prev) => merge(prev, { delimiter, newline: linebreak }) as ParseConfig);
    };

    const parseFile = () => {
        if (!file) return;

        Papa.parse(file, {
            ...options,
            worker: true,
            skipEmptyLines: true,
            error: (error) => console.error(error),
            complete: (res: ParseResult<any>) => {
                setData(res.data);
                setHeaders(res.meta.fields || null);
                setParseErrors(res.errors);
                combineOptions(res.meta);

                const criticalErr = res.errors.find((e) => e.type === "Quotes");
                if (criticalErr) setCriticalError(criticalErr);
            },
        });
    };

    return (
        <>
            <Stack>
                <Group>
                    <TextInput
                        w="150"
                        maxLength={4}
                        label="Delimiter"
                        description="Seperates the fields."
                        classNames={{ input: "borderless" }}
                        value={encodeCharacters(options.delimiter as string)}
                        onChange={(event) => setOptions((prev) => ({ ...prev, delimiter: decodeCharacters(event.currentTarget.value) }) as ParseConfig)}
                    />
                    <Select
                        w="150"
                        maxLength={4}
                        label="Line break"
                        description="The newline sequence."
                        classNames={{ input: "borderless" }}
                        value={encodeCharacters(options.newline as string)}
                        data={["\\r", "\\n", "\\r\\n"]}
                        onChange={(value) => setOptions((prev) => ({ ...prev, newline: decodeCharacters(value) }) as ParseConfig)}
                    />

                    <TextInput
                        w="150"
                        maxLength={4}
                        label="Quote character"
                        description="Used to quote fields."
                        classNames={{ input: "borderless" }}
                        value={encodeCharacters(options.quoteChar as string)}
                        onChange={(event) => setOptions((prev) => ({ ...prev, quoteChar: decodeCharacters(event.currentTarget.value) }) as ParseConfig)}
                    />
                    <TextInput
                        w="150"
                        maxLength={4}
                        label="Escape character"
                        description="Escapes quote in fields."
                        classNames={{ input: "borderless" }}
                        value={encodeCharacters(options.escapeChar as string)}
                        onChange={(event) => setOptions((prev) => ({ ...prev, escapeChar: decodeCharacters(event.currentTarget.value) }) as ParseConfig)}
                    />
                    <Group className={classes.rightControlsGroup}>
                        <Checkbox
                            size="md"
                            label="Header row"
                            onChange={() => setOptions((prev) => ({ ...prev, header: !prev.header }))}
                            checked={options.header as boolean}
                            classNames={{ label: classes.checkboxLabel }}
                        />
                        <Button
                            className={classes.reparseButton}
                            onClick={() => {
                                setData(null);
                                parseFile();
                            }}
                        >
                            <Group gap="6">
                                <IconRepeat
                                    size="14"
                                    stroke="3"
                                />
                                Reparse
                            </Group>
                        </Button>
                    </Group>
                </Group>
            </Stack>
            <SpreadsheetImportTable
                records={data}
                headers={headers}
                loading={isNull(data)}
                readOnly
                rowErrors={parseErrors}
                criticalError={criticalError}
            />
            <Paper className={classes.outputPaper}>
                <Group>
                    <Text
                        c={isEmpty(parseErrors) ? "lime" : "red.7"}
                        fw="600"
                    >
                        Parsing completed:{" "}
                        {criticalError ? `Critical error detected` : isEmpty(parseErrors) ? `No errors detected` : `${parseErrors.length} row errors detected.`}
                    </Text>
                    {!criticalError && !isEmpty(parseErrors) ? (
                        <>
                            <Button
                                variant="light"
                                color="gray"
                                size="compact-sm"
                                onClick={() => setCurrentFocusedError(0)}
                            >
                                Jump to first
                            </Button>
                            <Button
                                variant="light"
                                color="gray"
                                size="compact-sm"
                                onClick={() => setCurrentFocusedError((prev) => prev + 1)}
                            >
                                Jump to next
                            </Button>
                            <Button
                                variant="light"
                                color="gray"
                                size="compact-sm"
                                onClick={() => setParseErrors([])}
                            >
                                <Group gap="6">
                                    <IconEraser
                                        size="16"
                                        stroke={3}
                                    />
                                    Ignore all
                                </Group>
                            </Button>
                        </>
                    ) : undefined}
                </Group>
            </Paper>
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
                    onClick={cancel}
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
                    disabled={isNull(data) || !isEmpty(parseErrors) || !!criticalError}
                    onClick={() => onSubmit?.(data, headers)}
                >
                    <Group
                        gap="6"
                        ml="12px"
                    >
                        {t("next")}
                        <IconChevronRight
                            size={14}
                            stroke={5}
                        />
                    </Group>
                </Button>
            </Group>
        </>
    );
};

export default ParseSpreadsheetForm;
