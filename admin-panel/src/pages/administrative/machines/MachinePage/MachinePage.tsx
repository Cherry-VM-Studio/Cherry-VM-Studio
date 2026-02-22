import { Grid, Loader, LoadingOverlay } from "@mantine/core";
import { useParams } from "react-router-dom";
import Column from "../../../../components/atoms/layout/Column/Column";
import LogsDisplay from "../../../../components/molecules/display/LogsDisplay/LogsDisplay";
import MachineStateChart from "../../../../components/molecules/display/MachineStateChart/MachineStateChart";
import MachineEditForm from "../../../../components/organisms/forms/MachineEditForm/MachineEditForm";
import MachineDataDisplay from "../../../../components/templates/MachineDataDisplay/MachineDataDisplay";
import useMachineWebSocket from "../../../../hooks/useMachineWebSocket.ts";
import { isNull } from "lodash";
import ResourceLoading from "../../../../components/atoms/feedback/ResourceLoading/ResourceLoading.tsx";

function MachinePage() {
    const { uuid } = useParams();

    const { machines } = useMachineWebSocket("subscribed", uuid);
    const machine = machines?.[uuid] ?? null;

    return (
        <Grid
            display="flex"
            p="md"
        >
            {!isNull(machine) ? (
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
