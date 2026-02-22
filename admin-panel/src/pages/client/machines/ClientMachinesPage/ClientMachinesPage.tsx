import { isNull } from "lodash";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { Paper, Stack } from "@mantine/core";
import classes from "./ClientMachinesPage.module.css";
import MachinesGrid from "../../../../components/molecules/display/MachinesGrid/MachinesGrid";
import useMachineWebSocket from "../../../../hooks/useMachineWebSocket";

const ClientMachinesPage = (): React.JSX.Element => {
    const { sendErrorNotification } = useMantineNotifications();
    const { machines } = useMachineWebSocket("account");

    return (
        <Stack className={classes.container}>
            <Paper className={classes.tablePaper}>
                <MachinesGrid
                    machines={machines}
                    loading={isNull(machines)}
                    error={null}
                />
            </Paper>
        </Stack>
    );
};

export default ClientMachinesPage;
