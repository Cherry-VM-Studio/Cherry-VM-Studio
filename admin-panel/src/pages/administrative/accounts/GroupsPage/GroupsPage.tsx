import { Stack, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import GroupsTable from "../../../../components/organisms/tables/GroupsTable/GroupsTable";
import useFetch from "../../../../hooks/useFetch";
import GroupModal from "../../../../modals/account/GroupModal/GroupModal";
import classes from "./GroupsPage.module.css";
import { GroupExtended } from "../../../../types/api.types";

const GroupsPage = (): React.JSX.Element => {
    const { data: groupData, error, loading, refresh } = useFetch<Record<string, GroupExtended>>(`/groups/all`);
    const [currentUuid, setCurrentUuid] = useState<string>("");
    const [opened, { open, close }] = useDisclosure();

    const openGroupModal = (uuid: string) => {
        (setCurrentUuid(uuid), open());
    };

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <GroupModal
                    opened={opened}
                    onClose={close}
                    uuid={currentUuid}
                    refreshTable={refresh}
                />
                <GroupsTable
                    groups={groupData}
                    error={error}
                    loading={loading}
                    refresh={refresh}
                    openGroupModal={openGroupModal}
                />
            </Paper>
        </Stack>
    );
};

export default GroupsPage;
