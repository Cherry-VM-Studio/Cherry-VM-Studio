import { useMemo } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { getColumns } from "./columns";
import { MachineSnapshot } from "../../../../types/api.types";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { AxiosError } from "axios";
import _ from "lodash";

export interface SnapshotsTableProps {
    snapshots: Record<string, MachineSnapshot>;
    loading: boolean;
    error: AxiosError | null;
    refresh: () => void;
}

const SnapshotsTable = ({ snapshots, loading, error, refresh }: SnapshotsTableProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "snapshots.controls.");

    const data = useMemo(() => _.values(snapshots), [snapshots]);
    const columns = useMemo(() => getColumns(), []);

    return (
        <TanstackTable
            data={data}
            columns={columns}
            error={error}
            loading={loading}
            refresh={refresh}
            headingProps={{
                translations: {
                    all: tns("all-snapshots"),
                    selected: tns("selected-snapshots"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                modals: {},
                translations: {
                    import: tns("import"),
                    filter: tns("filters"),
                    delete: tns("delete-selected"),
                },
                hiddenButtons: {
                    create: true,
                },
                searchColumnKey: "name",
            }}
        />
    );
};

export default SnapshotsTable;
