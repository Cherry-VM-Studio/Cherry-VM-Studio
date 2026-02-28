import { Button, Checkbox, Group, Modal, Paper, Select, Stack, Stepper, Text, TextInput, Title } from "@mantine/core";
import { AccountType } from "../../../types/config.types";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { useEffect, useRef, useState } from "react";
import {
    IconArrowBigUpFilled,
    IconArrowDown,
    IconArrowUp,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
    IconEraser,
    IconRepeat,
} from "@tabler/icons-react";
import { isEmpty, isNull, max, min } from "lodash";
import Papa, { ParseConfig, ParseError, ParseResult } from "papaparse";
import SpreadsheetImportTable from "../../../components/organisms/tables/SpreadsheetImportTable/SpreadsheetImportTable";
import UploadSpreadsheetForm from "../../../components/organisms/forms/UploadSpreadsheetForm/UploadSpreadsheetForm";
import ImportAccountsModalHeader from "./ImportAccountsModalHeader";
import classes from "./ImportAccountsModal.module.css";
export interface ImportAccountModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
    accountType: AccountType;
}

const ImportAccountsModal = ({ opened, onClose, onSubmit, accountType }: ImportAccountModalProps): React.JSX.Element => {
    const defaultOptions = {
        delimiter: "",
        quoteChar: '"',
        escapeChar: '"',
        header: true,
    };

    const { tns, t } = useNamespaceTranslation("modals", "account");
    const [file, setFile] = useState<File | null>(null);
    const [active, setActive] = useState(0);
    const [options, setOptions] = useState<ParseConfig>(defaultOptions);
    const [data, setData] = useState<Array<Record<string, string> | Array<string>>>(null);
    const [headers, setHeaders] = useState<string[] | null>(null);
    const [errors, setErrors] = useState<ParseError[]>([]);
    const [criticalError, setCriticalError] = useState<ParseError | null>(null);
    const [currentFocusedError, setCurrentFocusedError] = useState(0);

    useEffect(() => {
        setActive(0);
        setFile(null);
        setData(null);
        setHeaders(null);
        setOptions(defaultOptions);
    }, [opened]);

    useEffect(() => {
        if (file) {
            parseFile();
            setActive(1);
        }
    }, [file]);

    useEffect(() => {
        if (isEmpty(errors)) return;

        if (currentFocusedError >= errors.length) {
            setCurrentFocusedError(0);
            return;
        }

        const row = errors[currentFocusedError].row;

        document.getElementById(`spreadsheet-table-row-${row}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [currentFocusedError, errors]);

    const parseFile = () => {
        if (!file) return;

        Papa.parse(file, {
            ...options,
            worker: true,
            skipEmptyLines: true,
            error: (error) => console.error(error),
            complete: (res: ParseResult<any>) => {
                setData(res.data);
                setErrors(res.errors);
                setOptions(
                    (prev) =>
                        ({
                            ...prev,
                            delimiter: res.meta.delimiter || prev.delimiter,
                            newline: res.meta.linebreak || prev.newline,
                        }) as ParseConfig,
                );
                setHeaders(res.meta.fields || null);

                const criticalErr = res.errors.find((e) => e.type === "Quotes");

                if (criticalErr) {
                    setCriticalError(criticalErr);
                }
            },
        });
    };

    const encodeCharacters = (value?: string) => {
        if (!value) return "";

        // If printable ASCII, return as-is
        if (/^[\x20-\x7E]$/.test(value)) return value;

        // Otherwise escape using JSON
        return JSON.stringify(value).slice(1, -1);
    };

    const decodeCharacters = (value: string) => {
        try {
            return JSON.parse(`"${value}"`);
        } catch {
            return value;
        }
    };

    const content = [
        <UploadSpreadsheetForm
            onUpload={(f) => setFile(f)}
            onReject={() => console.error("File rejected")}
        />,
        <>
            <Stack gap="md">
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
                    <Group
                        flex="1"
                        mt="42px"
                    >
                        <Checkbox
                            size="md"
                            label="Header row"
                            styles={{ label: { fontSize: "14px" } }}
                            checked={options.header as boolean}
                            onChange={() => setOptions((prev) => ({ ...prev, header: !prev.header }))}
                        />
                        <Button
                            w="120"
                            fw="500"
                            variant="white"
                            c="black"
                            onClick={() => {
                                setData(null);
                                parseFile();
                            }}
                            ml="auto"
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
                rowErrors={errors}
                criticalError={criticalError}
            />
            <Paper
                bg="dark.8"
                p="sm"
                bd="1px solid var(--mantine-color-dark-6)"
            >
                <Group>
                    <Text
                        c={isEmpty(errors) ? "lime" : "red.7"}
                        fw="600"
                    >
                        Parsing completed: {isEmpty(errors) ? `No errors detected` : `${errors.length} row errors detected.`}
                    </Text>
                    {!isEmpty(errors) ? (
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
                                onClick={() => setErrors([])}
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
                    styles={{ label: { width: "100%", justifyContent: "center" } }}
                    p="0"
                    onClick={() => {
                        setActive(0);
                        setData(null);
                        setHeaders(null);
                        setOptions(defaultOptions);
                    }}
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
                    w="150"
                    variant="white"
                    c={isNull(file) ? "dimmed" : "black"}
                    styles={{ label: { width: "100%", justifyContent: "center" } }}
                    p="0"
                    disabled={isNull(data) || !isEmpty(errors)}
                    onClick={() => {
                        setActive(1);
                        parseFile();
                    }}
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
        </>,
    ];

    return (
        <Modal
            opened={opened}
            title={<ImportAccountsModalHeader activeStep={active} />}
            onClose={onClose}
            size="auto"
            fullScreen
            classNames={{
                inner: classes.modalInner,
                content: classes.modalContent,
                body: classes.modalBody,
                header: classes.modalHeader,
                title: classes.modalTitle,
            }}
        >
            <Stack className={classes.modalStack}>{content[active]}</Stack>
        </Modal>
    );
};

export default ImportAccountsModal;
