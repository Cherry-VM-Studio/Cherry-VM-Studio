import { useMemo } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import IsoFileImportModal from "../../../../modals/iso-file-library/IsoFileImportModal/IsoFileImportModal";
import { IsoFile } from "../../../../types/api.types";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { getColumns } from "./columns";
import PERMISSIONS from "../../../../config/permissions.config";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { AxiosError } from "axios";
import DeleteModal from "../../../../modals/base/DeleteModal/DeleteModal";
import { prepareData } from "./data";

export interface IsoTableProps {
    isoFiles: Record<string, IsoFile>;
    loading: boolean;
    error: AxiosError | null;
    refresh: () => void;
}

const IsoTable = ({ isoFiles, loading, error, refresh }: IsoTableProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "iso.controls.");
    const { hasPermissions } = usePermissions();

    const viewMode = !hasPermissions(PERMISSIONS.MANAGE_ISO_FILES);

    const data = useMemo(() => prepareData(isoFiles), [JSON.stringify(isoFiles)]);
    const columns = useMemo(() => getColumns(), []);

    return (
        <TanstackTable
            data={data}
            columns={columns}
            error={error}
            loading={loading}
            refresh={refresh}
            defaultHiddenColumns={["file_location", "last_modified_at", "last_modified_by"]}
            headingProps={{
                translations: {
                    all: tns("all-files"),
                    selected: tns("selected-files"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                modals: {
                    create: {
                        component: IsoFileImportModal,
                        props: { onSubmit: refresh },
                    },
                    delete: {
                        component: DeleteModal,
                        props: {
                            i18nextPrefix: "confirm.iso-removal",
                            path: "iso/delete",
                        },
                    },
                },
                translations: {
                    create: tns("add-iso-file"),
                    import: tns("import"),
                    filter: tns("filters"),
                    delete: tns("delete-selected"),
                },
                hiddenButtons: {
                    import: true,
                },
                searchColumnKey: "name",
                viewMode,
            }}
        />
    );
};

export default IsoTable;
