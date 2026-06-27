import { Stack } from "@mantine/core";
import MachineHeading from "../../organisms/display/MachineHeading/MachineHeading.tsx";
import MachineDataTable from "../../organisms/display/MachineDataTable/MachineDataTable.tsx";
import { MachineState } from "../../../types/api.types.ts";

export interface MachineDataDisplay {
    machine: MachineState;
}

export default function MachineDataDisplay({ machine }) {
    return (
        <Stack
            pt="md"
            h="100%"
        >
            <MachineHeading machine={machine} />
            <MachineDataTable machine={machine} />
        </Stack>
    );
}
