import { t } from "i18next";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import { Group, Text } from "@mantine/core";
import BusinessCardCell, { filterFunction, sortingFunction } from "../../../atoms/table/BusinessCardCell";
import AvatarsCell from "../../../atoms/table/AvatarsCell";
import { IconDisc } from "@tabler/icons-react";

export const getColumns = () => [
    {
        accessorKey: "selection",
        enableSorting: false,
        header: CheckboxHeader,
        cell: CheckboxCell,
        maxSize: 50,
    },
    {
        accessorKey: "name",
        enableSorting: true,
        header: t("snapshots.table.headers.name", { ns: "pages" }),
        cell: (props) => (
            <Group gap="xs">
                <IconDisc size="28" /> {props.getValue()}
            </Group>
        ),
        minSize: 300,
        maxSize: 400,
    },
    {
        accessorKey: "created",
        enableSorting: true,
        header: t("snapshots.table.headers.creation-date", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{props.getValue()}</Text>,
        minSize: 100,
        maxSize: 200,
    },
    {
        accessorKey: "size",
        enableSorting: true,
        header: t("snapshots.table.headers.size", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{props.getValue()}</Text>,
        minSize: 100,
        maxSize: 200,
    },
    {
        accessorKey: "owner",
        enableSorting: true,
        header: t("snapshots.table.headers.owner", { ns: "pages" }),
        cell: BusinessCardCell,
        minSize: 200,
        sortingFn: sortingFunction,
        filterFn: filterFunction,
    },
    {
        accessorKey: "sharedWith",
        enableSorting: true,
        header: t("snapshots.table.headers.shared-with", { ns: "pages" }),
        cell: AvatarsCell,
        minSize: 200,
    },
];
