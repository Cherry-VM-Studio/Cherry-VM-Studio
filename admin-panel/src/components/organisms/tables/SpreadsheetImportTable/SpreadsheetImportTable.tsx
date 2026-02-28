import { Box, Flex, ScrollArea, TextInput, Tooltip } from "@mantine/core";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { isArray, isEmpty, isNull, isUndefined, keys, range, values } from "lodash";
import React, { useEffect, useMemo } from "react";
import { IconExclamationCircleFilled, IconFileAlert, IconList } from "@tabler/icons-react";
import ResourceLoading from "../../../atoms/feedback/ResourceLoading/ResourceLoading";
import { useTranslation } from "react-i18next";
import classes from "./SpreadsheetImportTable.module.css";
import cs from "classnames";
import { ParseError } from "papaparse";
import ResourceError from "../../../atoms/feedback/ResourceError/ResourceError";

export interface SpreadsheetImportTableProps {
    records: Array<Array<string> | Record<string, string>>;
    headers?: string[] | null;
    loading?: boolean;
    readOnly?: boolean;
    rowErrors?: ParseError[];
    criticalError?: ParseError;
}

const SpreadsheetImportTable = ({
    records,
    headers = null,
    loading = false,
    rowErrors = [],
    criticalError = null,
    readOnly = false,
}: SpreadsheetImportTableProps): React.JSX.Element => {
    const { t } = useTranslation();

    const getData = () => {
        const data = records?.map((record) => ({ ...record })) as Array<Record<string, string>>;
        if (isEmpty(data)) return [];

        rowErrors?.forEach((error) => (data[error.row].__error__ = error.message));
        return data;
    };

    const spreadsheetColumns = useMemo(
        () =>
            (headers || keys(records?.[0])).map((e: string) => ({
                accessorKey: e,
                header: () => (
                    <TextInput
                        readOnly={readOnly}
                        value={e}
                        classNames={{ input: "borderless" }}
                        variant="unstyled"
                        styles={{ input: { textOverflow: "ellipsis" } }}
                    />
                ),
                cell: ({ getValue }) => (
                    <TextInput
                        readOnly={readOnly}
                        value={getValue()}
                        classNames={{ input: "borderless" }}
                        variant="unstyled"
                        styles={{ input: { textOverflow: "ellipsis" } }}
                    />
                ),
                minSize: 200,
                maxSize: 300,
                enableSorting: false,
            })),
        [headers, records, readOnly],
    );

    const errorColumn = {
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
    };

    const data = useMemo(getData, [records, rowErrors]);

    const columns = useMemo(() => [isEmpty(rowErrors) ? undefined : errorColumn, ...spreadsheetColumns].filter((e) => e), [errorColumn, spreadsheetColumns]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <ScrollArea
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
                                              flexGrow: 1, // allows to grow and fill available space
                                              flexShrink: 0, // optional: don't shrink below minSize
                                              minWidth: header.column.columnDef.minSize,
                                              maxWidth: header.column.columnDef.maxSize,
                                          }}
                                      >
                                          {flexRender(header.column.columnDef.header, header.getContext())}
                                      </Box>
                                  ))}
                              </Box>
                          ))
                        : undefined}
                    {table.getRowModel().rows.map((row: any, i: number) => (
                        <Box
                            className={cs(classes.tr, { [`${classes.trError}`]: !isUndefined(row.original.__error__) })}
                            key={row.id}
                            id={`spreadsheet-table-row-${row.id}`}
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
                    ))}
                </>
            )}
        </ScrollArea>
    );
};

export default React.memo(SpreadsheetImportTable);
