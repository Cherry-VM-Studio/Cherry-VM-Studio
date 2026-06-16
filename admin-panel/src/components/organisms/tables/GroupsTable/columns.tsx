import { Button, Text } from "@mantine/core";
import { t } from "i18next";
import AvatarsCell from "../../../atoms/table/AvatarsCell";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";

export const getColumns = (openGroupModal: (uuid: string) => void) => [
    {
        accessorKey: "selection",
        enableSorting: false,
        header: CheckboxHeader,
        cell: CheckboxCell,
        size: 50,
        maxSize: 50,
        enableHiding: false,
    },
    {
        accessorKey: "details",
        header: t("accounts.table.headers.name", { ns: "pages" }),
        cell: (props) => <Text>{props.getValue()}</Text>,
        filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId).toLowerCase().startsWith(filterValue.toLowerCase()),
        minSize: 120,
        enableHiding: false,
    },
    {
        accessorKey: "count",
        header: t("accounts.table.headers.member-count", { ns: "pages" }),
        cell: (props) => <Text>{props.getValue()}</Text>,
        minSize: 120,
    },
    {
        accessorKey: "users",
        enableSorting: false,
        header: t("accounts.table.headers.members", { ns: "pages" }),
        cell: AvatarsCell,
        minSize: 200,
    },
    {
        accessorKey: "options",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
            <Button
                variant="default"
                className="border"
                onClick={() => openGroupModal(row.id)}
                w="180"
            >
                {t("view-&-edit")}
            </Button>
        ),
        minSize: 200,
        maxSize: 200,
        enableHiding: false,
    },
];
