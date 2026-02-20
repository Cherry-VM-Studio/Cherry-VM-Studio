import { useMemo } from "react";
import { Link } from "react-router-dom";
import PERMISSIONS from "../../../../config/permissions.config";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import CreateMachineSplitButton from "../../../molecules/interactive/CreateMachineSplitButton/CreateMachineSplitButton";
import { getColumns } from "./columns";
import { parseData } from "./data";
import { IconLayoutGrid } from "@tabler/icons-react";
import MachinesGrid from "../../../molecules/display/MachinesGrid/MachinesGrid";
import { MachineState, SimpleState, User } from "../../../../types/api.types";
import { AxiosError } from "axios";

export interface MachinesTableDataRow {
    uuid: string;
    details: {
        name: string;
        state: SimpleState;
        tags: string[];
    };
    state: SimpleState;
    cpu: number;
    ram: number;
    owner: User[];
    clients: User[];
    options: {
        state: SimpleState;
        uuid: string;
    };
}

export interface MachinesTableProps {
    machines: Record<string, MachineState>;
    loading: boolean;
    error: AxiosError | null;
    refresh: () => void;
    global: boolean;
    onRemove: (uuid: string) => void;
}

const MachinesTable = ({ machines, loading, refresh, error, global, onRemove }: MachinesTableProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "machines.controls.");
    const { hasPermissions } = usePermissions();

    const viewMode = global && !hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    const data = useMemo(() => parseData(machines), [global, machines, viewMode]);
    const columns = useMemo(() => getColumns(global, viewMode, onRemove), [global, viewMode]);

    return (
        <>
            <TanstackTable
                data={data}
                columns={columns}
                loading={loading}
                refresh={refresh}
                error={error}
                headingProps={{
                    translations: {
                        all: tns(global ? "all-machines" : "your-machines"),
                        filtered: tns("filtered-results"),
                        selected: "",
                    },
                }}
                controlsProps={{
                    translations: {
                        filter: tns("filters"),
                    },
                    viewMode: viewMode,
                    hiddenButtons: {
                        import: true,
                        create: true,
                    },
                    additionalButtons: !global
                        ? [
                              {
                                  name: "splitCreate",
                                  component: CreateMachineSplitButton,
                                  children: <>{tns("create-machine")}</>,
                                  props: {
                                      disabled: viewMode,
                                      onSubmit: refresh,
                                  },
                              },
                          ]
                        : [],
                }}
                RowComponent={Link}
                rowProps={(uuid) => ({ to: `/admin/machines/machine/${uuid}` })}
            />
        </>
    );
};

export default MachinesTable;
