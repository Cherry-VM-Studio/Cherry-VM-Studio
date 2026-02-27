import { ActionIcon, Box, ScrollArea } from "@mantine/core";
import { IconCaretDownFilled, IconCaretUpDown, IconCaretUpFilled, IconList } from "@tabler/icons-react";
import { flexRender, Table } from "@tanstack/react-table";
import React from "react";
import classes from "./TanstackTableBody.module.css";
import cs from "classnames";
import { useTranslation } from "react-i18next";
import ResourceError from "../../../atoms/feedback/ResourceError/ResourceError";
import ResourceLoading from "../../../atoms/feedback/ResourceLoading/ResourceLoading";

export interface TanstackTableBodyProps {
    table: Table<any>;
    loading: boolean;
    error: Response | null;
    RowComponent?: React.ComponentType<any>;
    rowProps?: (uuid: string) => Record<string, any>;
}

const TanstackTableBody = ({ table, loading, error, RowComponent, rowProps }: TanstackTableBodyProps): React.JSX.Element => {
    const { t } = useTranslation();
    RowComponent = RowComponent || Box;

    return (
        <ScrollArea
            className={cs(classes.table)}
            classNames={{ content: "auto-width full-height" }}
            scrollbars="xy"
            offsetScrollbars
            pos="relative"
        >
            {table.getHeaderGroups().map((headerGroup) => (
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
                            {header.column.getCanSort() && (
                                <ActionIcon
                                    variant="transparent"
                                    onClick={header.column.getToggleSortingHandler()}
                                    color="dimmed"
                                    size="xs"
                                >
                                    {
                                        {
                                            desc: <IconCaretDownFilled />,
                                            asc: <IconCaretUpFilled />,
                                            off: <IconCaretUpDown />,
                                        }[header.column.getIsSorted() || "off"]
                                    }
                                </ActionIcon>
                            )}
                        </Box>
                    ))}
                </Box>
            ))}

            {error ? (
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
                    <RowComponent
                        className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ""}`}
                        key={row.id}
                        {...rowProps?.(row.id)}
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
                    </RowComponent>
                ))
            )}
        </ScrollArea>
    );
};

export default TanstackTableBody;
