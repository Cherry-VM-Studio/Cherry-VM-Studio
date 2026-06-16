import { t } from "i18next";
import { AccountType } from "../../../../types/config.types";
import BadgesCell from "../../../atoms/table/BadgesCell";
import BusinessCardCell, { filterFunction, sortingFunction } from "../../../atoms/table/BusinessCardCell";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import DateDifferenceCell from "../../../atoms/table/DateDifferenceCell";
import AccountOptionsMenu from "../../../molecules/table/AccountOptionsMenu/AccountOptionsMenu";

export const getColumns = (
    accountType: AccountType,
    refresh: () => void,
    openAccountModal: (uuid: string, mode: boolean) => void,
    openPasswordModal: (uuid: string) => void
) => [
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
        header: t("accounts.table.headers.name", { ns: "pages" }),
        cell: BusinessCardCell,
        sortingFn: sortingFunction,
        filterFn: filterFunction,
        minSize: 130,
        enableHiding: false,
    },
    {
        administrative: {
            accessorKey: "roles",
            header: t("accounts.table.headers.roles", { ns: "pages" }),
            enableSorting: false,
            cell: BadgesCell,
            minSize: 200,
        },
        client: {
            accessorKey: "groups",
            header: t("accounts.table.headers.groups", { ns: "pages" }),
            enableSorting: false,
            cell: BadgesCell,
            minSize: 200,
        },
    }[accountType],
    {
        accessorKey: "lastActive",
        header: t("accounts.table.headers.last-active", { ns: "pages" }),
        cell: DateDifferenceCell,
        minSize: 80,
    },
    {
        accessorKey: "options",
        header: "",
        enableSorting: false,
        cell: (props) => (
            <AccountOptionsMenu
                {...props}
                openAccountModal={openAccountModal}
                openPasswordModal={openPasswordModal}
                refreshData={refresh}
                accountType={accountType}
            />
        ),
        maxSize: 50,
        enableHiding: false,
    },
];
