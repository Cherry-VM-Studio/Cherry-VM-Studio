import { useMemo } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { AxiosError } from "axios";
import DeleteModal from "../../../../modals/base/DeleteModal/DeleteModal";
import CreateTemplateModal from "../../../../modals/templates-library/CreateTemplateModal/CreateTemplateModal";
import { MachineTemplate } from "../../../../types/api.types";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { prepareData } from "./data";
import { getColumns } from "./columns";

export interface TemplatesTableProps {
    templates: Record<string, MachineTemplate>;
    loading: boolean;
    error: AxiosError | null;
    refresh: () => void;
}

const TemplatesTable = ({ templates, loading, error, refresh }: TemplatesTableProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "templates.controls.");
    const data = useMemo(() => prepareData(templates), [JSON.stringify(templates)]);
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
                    all: tns("all-templates"),
                    selected: tns("selected-templates"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                modals: {
                    create: {
                        component: CreateTemplateModal,
                        props: { onSubmit: refresh },
                    },
                    delete: {
                        component: DeleteModal,
                        props: {
                            i18nextPrefix: "confirm.template-removal",
                            path: "machine-templates/delete",
                        },
                    },
                },
                translations: {
                    import: tns("import"),
                    filter: tns("filters"),
                    delete: tns("delete-selected"),
                    create: tns("create-template"),
                },
                searchColumnKey: "name",
                hiddenButtons: {
                    import: true,
                },
            }}
        />
    );
};

export default TemplatesTable;
