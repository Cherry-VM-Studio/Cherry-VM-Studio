import { Grid } from "@mantine/core";
import { useParams } from "react-router-dom";
import Column from "../../../../components/atoms/layout/Column/Column";
import LogsDisplay from "../../../../components/molecules/display/LogsDisplay/LogsDisplay";
import MachineStateChart from "../../../../components/molecules/display/MachineStateChart/MachineStateChart";
import MachineEditForm from "../../../../components/organisms/forms/MachineEditForm/MachineEditForm";
import MachineDataDisplay from "../../../../components/templates/MachineDataDisplay/MachineDataDisplay";
import useMachineWebSocket from "../../../../hooks/useMachineWebSocket.ts";

function MachinePage() {
    const { uuid } = useParams();

    const { machines, loading, error } = useMachineWebSocket("subscribed", uuid);
    const machine = machines?.[uuid] ?? null;

    return (
        <Grid
            display="flex"
            p="md"
        >
            {!loading ? (
                <>
                    <Column
                        span={6}
                        h="45%"
                    >
                        <MachineDataDisplay machine={machine} />
                    </Column>
                    <Column
                        span={6}
                        h="45%"
                    >
                        <LogsDisplay />
                    </Column>
                    <Column
                        span={6}
                        h="55%"
                    >
                        {<MachineEditForm machine={machine} />}
                    </Column>
                    <Column
                        span={6}
                        h="55%"
                    >
                        <MachineStateChart machine={machine} />
                    </Column>
                </>
            ) : (
                <></>
            )}
        </Grid>
    );
}

export { MachinePage as default };
