import { t } from "i18next";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import { Group, Text } from "@mantine/core";
import { IconDisc } from "@tabler/icons-react";
import DateDifferenceCell from "../../../atoms/table/DateDifferenceCell";
import { formatBytesToRelevantUnit } from "../../../../utils/files";
import DateCell from "../../../atoms/table/DateCell";
import BusinessCardCell, { filterFunction, sortingFunction } from "../../../atoms/table/BusinessCardCell";

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
        header: t("iso.table.headers.name", { ns: "pages" }),
        cell: (props) => (
            <Group
                gap="xs"
                wrap="nowrap"
            >
                <IconDisc size="28" />
                <Text style={{ textOverflow: "ellipsis", textWrap: "nowrap" }}>{props.getValue()}</Text>
            </Group>
        ),
        minSize: 250,
        maxSize: 400,
        enableHiding: false,
    },
    {
        accessorKey: "file_location",
        enableSorting: true,
        header: t("iso.table.headers.location", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{props.getValue() || "Local"}</Text>,
        minSize: 300,
        maxSize: 400,
    },
    {
        accessorKey: "file_size_bytes",
        enableSorting: true,
        header: t("iso.table.headers.size", { ns: "pages" }),
        cell: (props) => <Text c="dimmed">{formatBytesToRelevantUnit(props.getValue())}</Text>,
        minSize: 120,
        maxSize: 200,
    },
    {
        accessorKey: "last_used",
        header: t("iso.table.headers.last-used", { ns: "pages" }),
        cell: DateDifferenceCell,
        minSize: 160,
        maxSize: 250,
    },
    {
        accessorKey: "imported_at",
        header: t("iso.table.headers.imported-at", { ns: "pages" }),
        cell: DateCell,
        minSize: 200,
        maxSize: 250,
    },
    {
        accessorKey: "last_modified_at",
        header: t("iso.table.headers.last-modified-at", { ns: "pages" }),
        cell: DateCell,
        minSize: 200,
        maxSize: 250,
    },
    {
        accessorKey: "imported_by",
        header: t("iso.table.headers.imported-by", { ns: "pages" }),
        cell: BusinessCardCell,
        minSize: 200,
        sortingFn: sortingFunction,
        filterFn: filterFunction,
    },
    {
        accessorKey: "last_modified_by",
        header: t("iso.table.headers.last-modified-by", { ns: "pages" }),
        cell: BusinessCardCell,
        minSize: 200,
        sortingFn: sortingFunction,
        filterFn: filterFunction,
    },
];
