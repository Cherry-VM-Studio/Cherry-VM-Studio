import { Stack, Paper, Portal } from "@mantine/core";
import { useState } from "react";
import AccountTable from "../../../../components/organisms/tables/AccountTable/AccountTable";
import useFetch from "../../../../hooks/useFetch";
import AccountModal from "../../../../modals/account/AccountModal/AccountModal";
import ChangePasswordModal from "../../../../modals/account/ChangePasswordModal/ChangePasswordModal";
import { AccountType } from "../../../../types/config.types";
import classes from "./UsersPage.module.css";
import { UserExtended } from "../../../../types/api.types";
import { useAuthentication } from "../../../../contexts/AuthenticationContext";
import { useProfile } from "../../../../contexts/ProfileContext";

const UsersPage = ({ accountType }: { accountType: AccountType }): React.JSX.Element => {
    const { data, error, loading, refresh: refreshUsers } = useFetch<Record<string, UserExtended>>(`/users/all?account_type=${accountType}`, undefined, true);
    const { updateProfile } = useProfile();
    const [currentUuid, setCurrentUuid] = useState<string>("");
    const [accountModalInEditMode, setAccountModalInEditMode] = useState<boolean>(false);
    const [modalsOpened, setModalsOpened] = useState({
        account: false,
        password: false,
    });

    const refresh = () => {
        updateProfile();
        refreshUsers();
    };

    const openPasswordModal = (uuid: string) => {
        setCurrentUuid(uuid);
        setModalsOpened((prev) => ({ ...prev, password: true }));
    };

    const closePasswordModal = () => setModalsOpened((prev) => ({ ...prev, password: false }));

    const openAccountModal = (uuid: string, mode: boolean) => {
        setAccountModalInEditMode(mode);
        setCurrentUuid(uuid);
        setModalsOpened((prev) => ({ ...prev, account: true }));
    };

    const closeAccountModal = () => setModalsOpened((prev) => ({ ...prev, account: false }));

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <Portal>
                    <ChangePasswordModal
                        uuid={currentUuid}
                        opened={modalsOpened.password}
                        onClose={closePasswordModal}
                    />
                </Portal>

                <AccountModal
                    inEditMode={accountModalInEditMode}
                    setInEditMode={setAccountModalInEditMode}
                    opened={modalsOpened.account}
                    refreshTable={refresh}
                    onClose={closeAccountModal}
                    openPasswordModal={openPasswordModal}
                    uuid={currentUuid}
                />

                <AccountTable
                    accountType={accountType}
                    accounts={data}
                    loading={loading}
                    error={error}
                    refresh={refresh}
                    openAccountModal={openAccountModal}
                    openPasswordModal={openPasswordModal}
                />
            </Paper>
        </Stack>
    );
};

export default UsersPage;
