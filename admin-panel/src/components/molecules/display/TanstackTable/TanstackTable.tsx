import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ComponentType, useState } from "react";
import classes from "./TanstackTable.module.css";
import { Group, Stack } from "@mantine/core";
import TableStateHeading, { TableStateHeadingProps } from "../../feedback/TableStateHeading/TableStateHeading";
import TableControls from "../../interactive/TableControls/TableControls";
import TanstackTableBody from "../TanstackTableBody/TanstackTableBody";
import { merge } from "lodash";
import { TableControlsProps } from "../../interactive/TableControls/TableControls.types";
import { AxiosError } from "axios";
import { IconTable, TablerIcon } from "@tabler/icons-react";
import TableFooter from "../../interactive/TableFooter/TableFooter";
import { useTranslation } from "react-i18next";

export interface TanstackTableLayout {
    component: ComponentType<any>;
    props?: Record<string, any>;
    icon: TablerIcon;
    name: string;
}

export interface TanstackTableProps {
    loading: boolean;
    error: AxiosError | null;
    data: Array<any>;
    columns: Array<any>;
    defaultHiddenColumns?: Array<string>;
    headingProps: Omit<TableStateHeadingProps, "table" | "loading">;
    controlsProps: Omit<TableControlsProps, "table" | "onFilteringChange">;
    RowComponent?: React.ComponentType<any>;
    refresh?: () => void;
    rowProps?: (uuid: string) => Record<string, any>;
    alternativeLayouts?: TanstackTableLayout[];
}

const TanstackTable = ({
    data,
    columns,
    loading,
    error,
    refresh,
    headingProps,
    controlsProps,
    RowComponent,
    rowProps,
    defaultHiddenColumns = [],
    alternativeLayouts = [],
}: TanstackTableProps): React.JSX.Element => {
    const { t } = useTranslation();
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [currentLayout, setCurrentLayout] = useState(0);

    const layouts: TanstackTableLayout[] = [
        { component: TanstackTableBody, props: { RowComponent, rowProps }, icon: IconTable, name: t("table") },
        ...alternativeLayouts,
    ];

    const layout = layouts[currentLayout];

    const LayoutComponent = layout.component;

    const table = useReactTable({
        data,
        columns: columns,
        initialState: {
            columnVisibility: Object.fromEntries(defaultHiddenColumns.map((key) => [key, false])),
        },
        state: {
            columnFilters,
            pagination,
        },
        getRowId: (row: any) => row.uuid,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const onDelete = () => {
        refresh();
        table.toggleAllRowsSelected(false);
    };

    const selectedUuids = table.getSelectedRowModel().rows.map((row) => row.id);

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading
                        table={table}
                        loading={loading}
                        {...headingProps}
                    />
                    <TableControls
                        table={table}
                        onFilteringChange={onFilteringChange}
                        {...controlsProps}
                        modals={merge(
                            controlsProps.modals,
                            controlsProps.modals?.delete && { delete: { props: { uuids: selectedUuids, onSubmit: onDelete } } },
                        )}
                    />
                </Group>
            </Stack>
            <LayoutComponent
                table={table}
                loading={loading}
                error={error}
                data={data}
                {...layout?.props}
            />
            <TableFooter
                layouts={layouts}
                currentLayout={currentLayout}
                setCurrentLayout={setCurrentLayout}
                pagination={pagination}
                setPagination={setPagination}
                getPageCount={table.getPageCount}
            />
        </Stack>
    );
};

export default TanstackTable;
