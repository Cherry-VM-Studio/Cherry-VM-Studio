import { useMemo } from "react";
import PERMISSIONS from "../../../../config/permissions.config";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import CreateMachineSplitButton from "../../../molecules/interactive/CreateMachineSplitButton/CreateMachineSplitButton";
import { getColumns } from "./columns";
import { parseData } from "./data";
import { Machine, MachineState, User } from "../../../../types/api.types";
import { AxiosError } from "axios";
import DeleteModal from "../../../../modals/base/DeleteModal/DeleteModal";
import MachinesGrid from "../../../molecules/display/MachinesGrid/MachinesGrid";
import { IconLayoutGrid } from "@tabler/icons-react";

export interface MachinesTableDataRow {
    uuid: string;
    details: {
        name: string;
        state: MachineState;
        tags: string[];
    };
    state: MachineState;
    cpu: number;
    ram: number;
    owner: User[];
    clients: User[];
    options: {
        state: MachineState;
        uuid: string;
    };
}

export interface MachinesTableProps {
    machines: Record<string, Machine>;
    loading: boolean;
    error: AxiosError | null;
    global: boolean;
    mode: "administrative" | "client";
}

const MachinesTable = ({ machines, loading, error, global, mode }: MachinesTableProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "machines.controls.");
    const { hasPermissions } = usePermissions();

    const viewMode = global && !hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    const data = useMemo(() => parseData(machines), [global, machines, viewMode]);
    const columns = useMemo(() => getColumns(global, viewMode), [global, viewMode]);

    return (
        <>
            <TanstackTable
                data={data}
                columns={columns}
                loading={loading}
                error={error}
                headingProps={{
                    translations: {
                        all: tns(global ? "all-machines" : "your-machines"),
                        filtered: tns("filtered-results"),
                        selected: tns("selected-machines"),
                    },
                }}
                controlsProps={{
                    translations: {
                        filter: tns("filters"),
                        delete: tns("delete-selected"),
                    },
                    viewMode: viewMode,
                    hiddenButtons: {
                        import: true,
                        create: true,
                        delete: mode === "client",
                        columns: mode === "client",
                    },
                    modals:
                        mode === "administrative"
                            ? {
                                  delete: {
                                      component: DeleteModal,
                                      props: {
                                          path: "/machines/delete",
                                          i18nextPrefix: "confirm.machine-removal",
                                      },
                                  },
                              }
                            : {},
                    additionalButtons:
                        mode === "administrative" && !global
                            ? [
                                  {
                                      name: "splitCreate",
                                      component: CreateMachineSplitButton,
                                      children: <>{tns("create-machine")}</>,
                                      props: {
                                          disabled: viewMode,
                                      },
                                  },
                              ]
                            : [],
                }}
                alternativeLayouts={[
                    {
                        component: MachinesGrid,
                        icon: IconLayoutGrid,
                        name: "Grid",
                        props: { machines, loading, error },
                    },
                ]}
                defaultLayout={mode === "administrative" ? 0 : 1}
                // RowComponent={Link}
                // rowProps={(uuid) => ({ to: `/admin/machines/machine/${uuid}` })}
            />
        </>
    );
};

export default MachinesTable;
