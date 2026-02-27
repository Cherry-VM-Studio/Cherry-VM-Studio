import { useMemo } from "react";
import { getColumns } from "./columns";
import { prepareData } from "./data";
import { Group } from "../../../../types/api.types";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import CreateGroupModal from "../../../../modals/account/CreateGroupModal/CreateGroupModal";
import DeleteModal from "../../../../modals/base/DeleteModal/DeleteModal";
import { AxiosError } from "axios";

export interface GroupsTableProps {
    groups: Record<string, Group>;
    error: AxiosError | null;
    loading: boolean;
    refresh: () => void;
    openGroupModal: (uuid: string) => void;
}

const GroupsTable = ({ groups, error, loading, refresh, openGroupModal }: GroupsTableProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "accounts.controls");

    const data = useMemo(() => prepareData(groups), [groups]);
    const columns = useMemo(() => getColumns(openGroupModal), [refresh, openGroupModal]);

    return (
        <TanstackTable
            data={data}
            columns={columns}
            error={error}
            loading={loading}
            refresh={refresh}
            headingProps={{
                translations: {
                    all: tns("all-groups"),
                    selected: tns("selected-groups"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                modals: {
                    create: {
                        component: CreateGroupModal,
                        props: { onSubmit: refresh },
                    },
                    delete: {
                        component: DeleteModal,
                        props: {
                            i18nextPrefix: "confirm.group-removal",
                            path: "groups/delete",
                        },
                    },
                },
                translations: {
                    create: tns("create-group"),
                    delete: tns("delete-selected"),
                    filter: tns("filters"),
                    import: tns("import"),
                },
                hiddenButtons: {
                    columns: true,
                    import: true,
                },
            }}
        />
    );
};

export default GroupsTable;
