import { Group, Loader, Title } from "@mantine/core";
import { Table } from "@tanstack/react-table";
import React from "react";

export interface TableStateHeadingProps {
    table: Table<any>;
    loading: boolean;
    translations: {
        selected: string;
        filtered: string;
        all: string;
    };
}

const TableStateHeading = ({ table, translations, loading }: TableStateHeadingProps): React.JSX.Element => {
    const areRowsSelected = table.getIsSomeRowsSelected() || table.getIsAllRowsSelected();
    const areRowsFiltered = table.getCoreRowModel().rows.length !== table.getRowCount();

    const heading = areRowsSelected ? translations.selected : areRowsFiltered ? translations.filtered : translations.all;
    const color = areRowsSelected ? "cherry.2" : "dimmed";
    const amount = areRowsSelected ? table.getSelectedRowModel().rows.length : table.getRowCount();

    return (
        <Group>
            <Title order={2}>{heading}</Title>
            <Title
                order={2}
                c={color}
            >
                {!loading && amount}
            </Title>
        </Group>
    );
};

export default TableStateHeading;
