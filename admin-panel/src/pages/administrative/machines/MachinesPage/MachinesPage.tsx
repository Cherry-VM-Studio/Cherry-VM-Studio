import { Stack, Paper } from "@mantine/core";
import MachinesTable from "../../../../components/organisms/tables/MachinesTable/MachinesTable";
import classes from "./MachinesPage.module.css";
import { isNull } from "lodash";
import useMachineWebSocket from "../../../../hooks/useMachineWebSocket";

export interface MachinesPageProps {
    global?: boolean;
}

// to resolve the issue with glitchy switches between global and private machine lists
const MachinesPage = ({ global = false }: MachinesPageProps): React.JSX.Element => {
    return (
        <MachinesPageInner
            key={global ? "global" : "private"}
            global={global}
        />
    );
};

const MachinesPageInner = ({ global = false }: MachinesPageProps): React.JSX.Element => {
    const { machines } = useMachineWebSocket(global ? "global" : "account");

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <MachinesTable
                    machines={machines}
                    loading={isNull(machines)}
                    error={null}
                    global={global}
                />
            </Paper>
        </Stack>
    );
};

export default MachinesPage;
