import { Stack } from "@mantine/core";
import MachineHeading from "../../organisms/display/MachineHeading/MachineHeading.tsx";
import MachineDataTable from "../../organisms/display/MachineDataTable/MachineDataTable.tsx";
import { Machine } from "../../../types/api.types.ts";

export interface MachineDataDisplayProps {
    machine: Machine;
}

export default function MachineDataDisplay({ machine }: MachineDataDisplayProps) {
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
