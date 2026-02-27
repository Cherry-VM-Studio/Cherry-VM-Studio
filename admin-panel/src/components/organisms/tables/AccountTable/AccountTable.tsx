import { useMemo } from "react";
import PERMISSIONS from "../../../../config/permissions.config";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import CreateAccountModal from "../../../../modals/account/CreateAccountModal/CreateAccountModal";
import DeleteAccountsModal from "../../../../modals/account/DeleteAccountsModal/DeleteAccountsModal";
import { IconUserPlus } from "@tabler/icons-react";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { getColumns } from "./columns";
import { UserExtended } from "../../../../types/api.types";
import { AccountType } from "../../../../types/config.types";
import { prepareData } from "./data";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { AxiosError } from "axios";
import ImportAccountsModal from "../../../../modals/account/ImportAccountsModal/ImportAccountsModal";

export interface AccountTableProps {
    loading: boolean;
    error: AxiosError | null;
    accounts: Record<string, UserExtended>;
    accountType: AccountType;
    refresh: () => void;
    openAccountModal: (uuid: string, mode: boolean) => void;
    openPasswordModal: (uuid: string) => void;
}

const AccountTable = ({ accounts, accountType, loading, error, refresh, openAccountModal, openPasswordModal }: AccountTableProps): React.JSX.Element => {
    const { hasPermissions } = usePermissions();
    const { tns } = useNamespaceTranslation("pages", "accounts.controls.");

    const columns = useMemo(() => getColumns(accountType, refresh, openAccountModal, openPasswordModal), [accountType]);
    const data = useMemo(() => prepareData(accounts), [accounts]);

    return (
        <TanstackTable
            columns={columns}
            data={data}
            error={error}
            loading={loading}
            refresh={refresh}
            headingProps={{
                translations: {
                    all: tns("all-accounts"),
                    selected: tns("selected-accounts"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                viewMode: !hasPermissions(accountType === "administrative" ? PERMISSIONS.MANAGE_ADMIN_USERS : PERMISSIONS.MANAGE_CLIENT_USERS),
                icons: { create: IconUserPlus },
                modals: {
                    create: {
                        component: CreateAccountModal,
                        props: { accountType, onSubmit: refresh },
                    },
                    delete: {
                        component: DeleteAccountsModal,
                    },
                    import: {
                        component: ImportAccountsModal,
                        props: { accountType, onSubmit: refresh },
                    },
                },
                translations: {
                    create: tns("create-account"),
                    delete: tns("delete-selected"),
                    import: tns("import"),
                    filter: tns("filters"),
                },
                hiddenButtons: {
                    columns: true,
                },
            }}
        />
    );
};

export default AccountTable;
