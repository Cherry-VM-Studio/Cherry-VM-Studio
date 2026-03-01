import { Box, Flex, ScrollArea, Select, TextInput, Tooltip } from "@mantine/core";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { isEmpty, isNull, isUndefined, keys, values } from "lodash";
import React, { useMemo } from "react";
import { IconCircle, IconCircleCheck, IconExclamationCircleFilled, IconFileAlert, IconList } from "@tabler/icons-react";
import ResourceLoading from "../../../atoms/feedback/ResourceLoading/ResourceLoading";
import { useTranslation } from "react-i18next";
import classes from "./SpreadsheetImportTable.module.css";
import cs from "classnames";
import { ParseError } from "papaparse";
import ResourceError from "../../../atoms/feedback/ResourceError/ResourceError";
import { useVirtualizer } from "@tanstack/react-virtual";
import AssignPropertiesHeader from "../../../atoms/table/AssignPropertiesHeader";

export interface SpreadsheetImportTableProps {
    records: Array<Array<string> | Record<string, string>>;
    headers?: string[] | null;
    loading?: boolean;
    readOnly?: boolean;
    rowErrors?: ParseError[];
    criticalError?: ParseError;
    propertyAssignment?: {
        assignment: Record<string, string>;
        setAssignment: React.Dispatch<React.SetStateAction<Record<string, string>>>;
        properties: string[];
    };
}

interface SelectHeaderCellProps {
    columnKey: string;
    propertyAssignment: SpreadsheetImportTableProps["propertyAssignment"];
}

const SelectHeaderCell = React.memo(({ columnKey, propertyAssignment }: SelectHeaderCellProps) => {
    const { assignment, setAssignment, properties } = propertyAssignment!;

    const onChange = React.useCallback(
        (val: string) => {
            if (assignment[columnKey] === val) return; // no-op if same
            setAssignment((prev) => ({ ...prev, [columnKey]: val }));
        },
        [assignment, columnKey, setAssignment],
    );

    return (
        <Select
            w="100%"
            variant="filled"
            value={assignment[columnKey]}
            onChange={onChange}
            data={properties}
            mt="xs"
            mb="xs"
        />
    );
});

const SpreadsheetImportTable = ({
    records,
    headers = null,
    loading = false,
    rowErrors = [],
    criticalError = null,
    readOnly = false,
    propertyAssignment = null,
}: SpreadsheetImportTableProps): React.JSX.Element => {
    const { t } = useTranslation();

    const parentRef = React.useRef<HTMLDivElement>(null);

    const data = useMemo(() => {
        if (!records?.length) return [];

        return records.map((record, index) => ({
            ...(record as Record<string, string>),
            __error__: rowErrors?.find((e) => e.row === index)?.message,
        }));
    }, [JSON.stringify(records), JSON.stringify(rowErrors)]);

    const spreadsheetColumns = useMemo(
        () =>
            (headers || keys(records?.[0])).map((key: string) => ({
                accessorKey: key,
                header: () =>
                    propertyAssignment ? (
                        <AssignPropertiesHeader
                            columnKey={key}
                            properties={propertyAssignment.properties}
                            values={propertyAssignment.assignment}
                            setValues={propertyAssignment.setAssignment}
                        />
                    ) : (
                        <Flex className={classes.cellText}>{key}</Flex>
                    ),
                cell: ({ getValue }) =>
                    readOnly ? (
                        <Flex className={classes.cellText}>{getValue() as string}</Flex>
                    ) : (
                        <TextInput
                            value={getValue()}
                            variant="unstyled"
                            styles={{ input: { textOverflow: "ellipsis" } }}
                        />
                    ),
                minSize: 200,
                maxSize: 300,
                enableSorting: false,
            })),
        [JSON.stringify(headers), readOnly, JSON.stringify(propertyAssignment?.assignment)],
    );

    const errorColumn = useMemo(
        () => ({
            accessorKey: "__error__",
            header: undefined,
            cell: ({ getValue }) =>
                getValue() ? (
                    <Tooltip
                        label={getValue()}
                        position="right"
                        className={classes.errorTooltip}
                    >
                        <Flex className={classes.errorIconWrapper}>
                            <IconExclamationCircleFilled
                                color="var(--mantine-color-red-7)"
                                size="22"
                            />
                        </Flex>
                    </Tooltip>
                ) : (
                    <></>
                ),
            minSize: 48,
            maxSize: 48,
        }),
        [],
    );

    const columns = useMemo(
        () => [isEmpty(rowErrors) ? undefined : errorColumn, ...spreadsheetColumns].filter((e) => e),
        [rowErrors, errorColumn, spreadsheetColumns],
    );

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    const rows = useMemo(() => table.getRowModel().rows, [data]);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 10,
    });

    return (
        <ScrollArea
            viewportRef={parentRef}
            className={cs(classes.table)}
            classNames={{ content: "auto-width full-height" }}
            scrollbars="xy"
            pos="relative"
            type="auto"
        >
            {criticalError && isNull(data) ? (
                <ResourceError
                    icon={IconFileAlert}
                    title={t("error-occured")}
                    message={t("error-parsing", { error: `${criticalError.message}` })}
                />
            ) : loading ? (
                <ResourceLoading
                    icon={IconList}
                    title={t("loading")}
                    message={t("parsing-spreadsheet-file")}
                />
            ) : (
                <>
                    {headers
                        ? table.getHeaderGroups().map((headerGroup) => (
                              <Box
                                  className={classes.tr}
                                  key={headerGroup.id}
                              >
                                  {headerGroup.headers.map((header) => (
                                      <Box
                                          className={classes.th}
                                          key={header.id}
                                          style={{
                                              flexBasis: header.getSize(),
                                              flexGrow: 1,
                                              flexShrink: 0,
                                              minWidth: header.column.columnDef.minSize,
                                              maxWidth: header.column.columnDef.maxSize,
                                          }}
                                      >
                                          {flexRender(header.column.columnDef.header, header.getContext())}
                                      </Box>
                                  ))}
                              </Box>
                          ))
                        : null}

                    <Box
                        style={{
                            height: rowVirtualizer.getTotalSize(),
                            position: "relative",
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = rows[virtualRow.index];

                            return (
                                <Box
                                    key={row.id}
                                    id={`spreadsheet-table-row-${row.id}`}
                                    className={cs(classes.tr, {
                                        [`${classes.trError}`]: !isUndefined(row.original.__error__),
                                    })}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <Box
                                            className={classes.td}
                                            key={cell.id}
                                            style={{
                                                flexBasis: cell.column.getSize(),
                                                flexGrow: 1,
                                                flexShrink: 0,
                                                minWidth: cell.column.columnDef.minSize,
                                                maxWidth: cell.column.columnDef.maxSize,
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Box>
                                    ))}
                                </Box>
                            );
                        })}
                    </Box>
                </>
            )}
        </ScrollArea>
    );
};

export default React.memo(SpreadsheetImportTable);
