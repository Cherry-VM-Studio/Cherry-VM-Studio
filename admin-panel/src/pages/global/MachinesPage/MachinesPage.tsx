import { Stack, Paper } from "@mantine/core";
import MachinesTable from "../../../components/organisms/tables/MachinesTable/MachinesTable";
import classes from "./MachinesPage.module.css";
import useMachineWebSocket from "../../../hooks/useMachineWebSocket";
import { AxiosError } from "axios";

export interface MachinesPageProps {
    global?: boolean;
    mode: "administrative" | "client";
}

// to resolve the issue with glitchy switches between global and private machine lists
const MachinesPage = ({ global = false, mode }: MachinesPageProps): React.JSX.Element => {
    return (
        <MachinesPageInner
            key={global ? "global" : "private"}
            global={global}
            mode={mode}
        />
    );
};

const MachinesPageInner = ({ global = false, mode }: MachinesPageProps): React.JSX.Element => {
    const { machines, loading, error } = useMachineWebSocket(global && mode === "administrative" ? "global" : "account");

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <MachinesTable
                    machines={machines}
                    loading={loading}
                    error={error ? new AxiosError("Error occurred with the WebSocket", "503") : null}
                    global={global}
                    mode={mode}
                />
            </Paper>
        </Stack>
    );
};

export default MachinesPage;
