import { t } from "i18next";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import { Group, Text } from "@mantine/core";
import { IconFileSettings } from "@tabler/icons-react";
import DateCell from "../../../atoms/table/DateCell";

export const getColumns = () => [
    {
        accessorKey: "selection",
        enableSorting: false,
        header: CheckboxHeader,
        cell: CheckboxCell,
        maxSize: 50,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        enableSorting: true,
        header: t("templates.table.headers.name", { ns: "pages" }),
        cell: (props) => (
            <Group gap="xs">
                <IconFileSettings size="28" /> {props.getValue()}
            </Group>
        ),
        minSize: 300,
        maxSize: 400,
        enableHiding: false,
    },
    {
        accessorKey: "ram",
        enableSorting: true,
        header: t("templates.table.headers.ram", { ns: "pages" }),
        cell: (props) => <Text>{`${props.getValue()} ${t("templates.table.ram-unit", { ns: "pages", count: props.getValue() })}`}</Text>,
        minSize: 100,
        maxSize: 200,
    },
    {
        accessorKey: "vcpu",
        enableSorting: true,
        header: t("templates.table.headers.vcpu", { ns: "pages" }),
        cell: (props) => <Text>{`${props.getValue()} ${t("templates.table.vcpu-unit", { ns: "pages", count: props.getValue() })}`}</Text>,
        minSize: 100,
        maxSize: 200,
    },
    {
        accessorKey: "created_at",
        enableSorting: true,
        header: t("templates.table.headers.creation-date", { ns: "pages" }),
        cell: DateCell,
        minSize: 100,
    },
];
