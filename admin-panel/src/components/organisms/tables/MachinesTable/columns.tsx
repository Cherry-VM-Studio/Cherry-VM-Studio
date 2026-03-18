import { t } from "i18next";
import MachineDetailsCell from "../../../atoms/table/MachineDetailsCell";
import ProgressWithPercentage from "../../../atoms/feedback/ProgressWithPercentage/ProgressWithPercentage";
import MachineControlsCell from "../../../atoms/table/MachineControlsCell";
import MachineStateCell, { sortingFunction as machineStateCellSoringFn } from "../../../atoms/table/MachineStateCell";
import MachineAssignedUserCell, {
    filterFunction as assignedUsersCellFilterFn,
    sortingFunction as assignedUsersCellSortingFn,
} from "../../../atoms/table/MachineAssignedUserCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import MachineControlsHeader from "../../../atoms/table/MachineControlsHeader";
import { Flex, ScrollArea, Stack, Text } from "@mantine/core";
import MachineDisksCell from "../../../atoms/table/MachineDisksCell";

export const getColumns = (global: boolean, viewMode: boolean) =>
    [
        {
            accessorKey: "selection",
            enableSorting: false,
            header: CheckboxHeader,
            cell: CheckboxCell,
            maxSize: 50,
            enableHiding: false,
        },
        {
            accessorKey: "details",
            header: t("machines.table.headers.name", { ns: "pages" }),
            cell: MachineDetailsCell,
            minSize: 200,
            maxSize: 400,
            sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
            filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
            enableHiding: false,
        },
        {
            accessorKey: "description",
            header: t("machines.table.headers.description", { ns: "pages" }),
            minSize: 200,
            enableSorting: false,
            cell: ({ getValue }) => (
                <ScrollArea type="auto">
                    <Text size="sm">{getValue()}</Text>
                </ScrollArea>
            ),
        },
        {
            accessorKey: "state",
            header: t("machines.table.headers.state", { ns: "pages" }),
            cell: MachineStateCell,
            minSize: 200,
            maxSize: 300,
            sortingFn: machineStateCellSoringFn,
        },
        {
            accessorKey: "port",
            header: t("machines.table.headers.port", { ns: "pages" }),
            cell: ({ getValue }) => <Text>{getValue()}</Text>,
            minSize: 120,
            maxSize: 120,
            sortingFn: (rowA: any, rowB: any, columnId: string) => {
                const a = Number(rowA.getValue(columnId));
                const b = Number(rowB.getValue(columnId));

                const aNaN = Number.isNaN(a);
                const bNaN = Number.isNaN(b);

                if (aNaN && bNaN) return 0;

                if (aNaN) return 1;
                if (bNaN) return -1;

                return a - b;
            },
        },
        {
            accessorKey: "ram",
            header: t("machines.table.headers.ram", { ns: "pages" }),
            cell: ({ getValue }) => (
                <ProgressWithPercentage
                    value={getValue()}
                    transitionDuration={200}
                    w="65%"
                    size="sm"
                />
            ),
            minSize: 100,
            maxSize: 300,
        },

        {
            accessorKey: "owner",
            header: t("machines.table.headers.owner", { ns: "pages" }),
            cell: MachineAssignedUserCell,
            minSize: 100,
            maxSize: 500,
            sortingFn: assignedUsersCellSortingFn,
            filterFn: assignedUsersCellFilterFn,
        },
        {
            accessorKey: "clients",
            header: t("machines.table.headers.assigned-clients", { ns: "pages" }),
            cell: MachineAssignedUserCell,
            minSize: 180,
            maxSize: 300,
            sortingFn: assignedUsersCellSortingFn,
            filterFn: assignedUsersCellFilterFn,
        },
        {
            accessorKey: "connected_users",
            header: t("machines.table.headers.connected-users", { ns: "pages" }),
            cell: MachineAssignedUserCell,
            minSize: 180,
            maxSize: 300,
            sortingFn: assignedUsersCellSortingFn,
            filterFn: assignedUsersCellFilterFn,
        },
        {
            accessorKey: "disks",
            header: t("machines.table.headers.disks", { ns: "pages" }),
            cell: MachineDisksCell,
            minSize: 100,
            enableSorting: false,
        },
        {
            accessorKey: "options",
            header: (props) => (
                <MachineControlsHeader
                    {...props}
                    disabled={viewMode}
                />
            ),
            enableSorting: false,
            cell: ({ getValue }) => (
                <MachineControlsCell
                    {...getValue()}
                    disabled={viewMode}
                />
            ),
            minSize: 50,
            enableHiding: false,
        },
    ].filter((e) => e);
