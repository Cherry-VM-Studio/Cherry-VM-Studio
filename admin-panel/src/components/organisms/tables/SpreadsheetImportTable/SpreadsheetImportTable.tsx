import { Box, ScrollArea, TextInput } from "@mantine/core";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { isArray, isNull, values } from "lodash";
import React, { useMemo } from "react";
import { IconList } from "@tabler/icons-react";
import ResourceLoading from "../../../atoms/feedback/ResourceLoading/ResourceLoading";
import { useTranslation } from "react-i18next";
import classes from "./SpreadsheetImportTable.module.css";
import cs from "classnames";
import { ParseError } from "papaparse";
import ResourceError from "../../../atoms/feedback/ResourceError/ResourceError";

export interface SpreadsheetImportTableProps {
    records: Array<Array<string> | Record<string, string>>;
    headers: string[] | null;
    loading: boolean;
    readOnly: boolean;
    errors: ParseError[];
}

const SpreadsheetImportTable = ({ records, loading, errors, headers, readOnly }: SpreadsheetImportTableProps): React.JSX.Element => {
    const { t } = useTranslation();
    const data = useMemo(() => (isArray(records?.[0]) ? records.map((record) => Object.assign({}, record)) : records), [records]);
    const columns = useMemo(
        () =>
            (headers || Array.from({ length: values(records?.[0]).length ?? 0 }, (_, i) => `${i}`)).map((e: string) => ({
                accessorKey: e,
                header: isNull(headers)
                    ? undefined
                    : () => (
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

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <ScrollArea
            className={cs(classes.table)}
            classNames={{ content: "auto-width full-height" }}
            scrollbars="xy"
            pos="relative"
            type="auto"
        >
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

            {errors.length && isNull(data) ? (
                <ResourceError
                    icon={IconList}
                    message={t("error-table")}
                    mt="-64px"
                />
            ) : loading ? (
                <ResourceLoading
                    icon={IconList}
                    message={t("loading-table")}
                    mt="-64px"
                />
            ) : (
                table.getRowModel().rows.map((row: any, i: number) => (
                    <Box
                        className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ""}`}
                        key={row.id}
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
                ))
            )}
        </ScrollArea>
    );
};

export default React.memo(SpreadsheetImportTable);
