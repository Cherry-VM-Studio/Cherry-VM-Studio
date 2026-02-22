import { Paper, Stack } from "@mantine/core";
import classes from "./ClientMachinesPage.module.css";
import MachinesGrid from "../../../../components/molecules/display/MachinesGrid/MachinesGrid";
import useMachineWebSocket from "../../../../hooks/useMachineWebSocket";
import { AxiosError } from "axios";

const ClientMachinesPage = (): React.JSX.Element => {
    const { machines, loading, error } = useMachineWebSocket("account");

    return (
        <Stack className={classes.container}>
            <Paper className={classes.tablePaper}>
                <MachinesGrid
                    machines={machines}
                    loading={loading}
                    error={error ? new AxiosError("Error occurred with the WebSocket", "503") : null}
                />
            </Paper>
        </Stack>
    );
};

export default ClientMachinesPage;
