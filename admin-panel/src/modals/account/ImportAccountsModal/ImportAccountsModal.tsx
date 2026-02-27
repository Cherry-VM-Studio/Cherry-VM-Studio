import { Button, Checkbox, Flex, Group, Modal, Select, Stack, Stepper, Text, TextInput, Title } from "@mantine/core";
import { AccountType } from "../../../types/config.types";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { useEffect, useRef, useState } from "react";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconChevronLeft, IconChevronRight, IconFileTypeCsv, IconRepeat, IconUpload, IconX } from "@tabler/icons-react";
import { isNull, truncate } from "lodash";
import { formatBytesToRelevantUnit } from "../../../utils/files";
import Papa, { ParseConfig, ParseError, ParseResult } from "papaparse";
import SpreadsheetImportTable from "../../../components/organisms/tables/SpreadsheetImportTable/SpreadsheetImportTable";
import dummies from "./dummies.js";

export interface ImportAccountModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
    accountType: AccountType;
}

const MAX_CSV_SIZE = 20 * 1024 * 1024; // 20MiB

const ImportAccountsModal = ({ opened, onClose, onSubmit, accountType }: ImportAccountModalProps): React.JSX.Element => {
    const defaultOptions = {
        delimiter: "",
        quoteChar: '"',
        escapeChar: '"',
        header: true,
    };

    const openRef = useRef<() => void>(null);

    const { tns, t } = useNamespaceTranslation("modals", "account");
    const [file, setFile] = useState<File | null>(null);
    const [active, setActive] = useState(0);
    const [options, setOptions] = useState<ParseConfig>(defaultOptions);
    const [data, setData] = useState<Array<Record<string, string> | Array<string>>>(null);
    const [headers, setHeaders] = useState<string[] | null>(null);
    const [errors, setErrors] = useState<ParseError[]>([]);

    useEffect(() => {
        // setActive(0);
        // setFile(null);
        // setData(null);
        // setHeaders(null);
        // setOptions(defaultOptions);
    }, [opened]);

    useEffect(() => {
        if (file) {
            parseFile();
            setActive(1);
        }
    }, [file]);

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

    const modalHeader = (
        <Stack
            pl="8px"
            pr="32px"
            pt="16px"
        >
            <Stepper
                active={active}
                pr="lg"
            >
                <Stepper.Step
                    label="Step 1:"
                    description="Upload the file"
                >
                    <Group
                        w="100%"
                        gap="4rem"
                        pr="xl"
                    >
                        <Stack
                            gap="4"
                            flex="1"
                        >
                            <Title
                                order={2}
                                mt="lg"
                            >
                                Upload the file
                            </Title>
                            <Text>Make sure the file is in the CSV format.</Text>
                        </Stack>
                        <Stack
                            gap="4"
                            flex="1"
                        >
                            <Title
                                order={2}
                                mt="lg"
                            >
                                The data we're looking for
                            </Title>
                            <Text>You will have the chance to rename and rearange the columns in the next steps. </Text>
                        </Stack>
                    </Group>
                </Stepper.Step>
                <Stepper.Step
                    label="Step 2:"
                    description="Choose parsing options"
                >
                    <Stack
                        gap="4"
                        flex="1"
                    >
                        <Title
                            order={2}
                            mt="lg"
                        >
                            Configure parsing
                        </Title>
                        <Text>Define the parsing configuration and click the reparse button submit changes.</Text>
                    </Stack>
                </Stepper.Step>
                <Stepper.Step
                    label="Step 3:"
                    description="Assign columns to parameters"
                />
                <Stepper.Step
                    label="Step 4:"
                    description="Validate and submit"
                />
            </Stepper>
        </Stack>
    );

    const content = [
        <>
            <Group
                w="100%"
                gap="4rem"
                align="start"
                flex="1"
                mih="0"
                pb="xl"
                pr="xl"
            >
                <Flex
                    flex="1"
                    h="100%"
                    maw="50%"
                >
                    <Dropzone
                        acceptColor="lime.6"
                        accept={[MIME_TYPES.csv]}
                        multiple={false}
                        maxFiles={1}
                        onDrop={(files) => setFile(files[0])}
                        onReject={(files) => console.log(files)}
                        maxSize={MAX_CSV_SIZE}
                        flex="1"
                        p="lg"
                        styles={{
                            inner: {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                flexDirection: "column",
                                gap: "var(--mantine-spacing-lg)",
                            },
                        }}
                        activateOnClick={false}
                        openRef={openRef}
                    >
                        <Group
                            justify="center"
                            gap="xl"
                            style={{ pointerEvents: "none" }}
                        >
                            <Dropzone.Accept>
                                <IconUpload
                                    size={52}
                                    color="var(--mantine-color-lime-5)"
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    size={52}
                                    color="var(--mantine-color-cherry-6)"
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFileTypeCsv
                                    size={52}
                                    color={isNull(file) ? "white" : "var(--mantine-color-lime-5)"}
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>

                            <div>
                                <Text
                                    size="xl"
                                    inline
                                    c="white"
                                >
                                    Drag your CSV spreadsheet here
                                </Text>
                                <Text
                                    size="sm"
                                    inline
                                    mt={7}
                                    c="dark.1"
                                >
                                    File should not exceed 20MB
                                </Text>
                            </div>
                        </Group>
                        <Button
                            w="140"
                            variant="white"
                            c="black"
                            onClick={() => openRef.current?.()}
                            style={{ pointerEvents: "all" }}
                        >
                            Upload file
                        </Button>
                    </Dropzone>
                </Flex>
                <Flex
                    flex="1"
                    mah="100%"
                    maw="50%"
                >
                    <SpreadsheetImportTable
                        headers={["name", "surname", "email", "username", "password", "account_type", "memberships"]}
                        loading={false}
                        readOnly
                        records={dummies}
                        errors={[]}
                    />
                </Flex>
            </Group>
        </>,
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
                errors={errors}
            />
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
                    disabled={isNull(file)}
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
            title={modalHeader}
            onClose={onClose}
            size="auto"
            fullScreen
            styles={{
                inner: {
                    margin: 32,
                    width: "calc(100vw - 64px)",
                },
                content: {
                    width: "calc(100vw - 64px)",
                    height: "calc(100vh - 64px)",
                    maxHeight: "calc(100vh - 64px)",
                    borderRadius: "var(--mantine-radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                },
                body: {
                    padding: "0 20px 20px",
                    minHeight: "0",
                    flex: 1,
                },
                title: { fontSize: "var(--mantine-h2-font-size)", flex: 1 },
                header: { alignItems: "start", minHeight: "fit-content" },
            }}
        >
            <Stack
                h="100%"
                flex="1"
            >
                {content[active]}
            </Stack>
        </Modal>
    );
};

export default ImportAccountsModal;
