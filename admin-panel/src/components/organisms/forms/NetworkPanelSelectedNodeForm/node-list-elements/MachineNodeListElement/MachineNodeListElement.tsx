import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { getResourceUuidFromNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";
import { MachinePropertiesPayload } from "../../../../../../types/api.types";
import { IconLinkOff } from "@tabler/icons-react";
import classes from "../ListElements.module.css";
import { NetworkPanelEdge, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";

export interface MachineNodeListElementProps {
    selectedNode: NetworkPanelNode;
    machineNodeId: string;
    machines: Record<string, MachinePropertiesPayload>;
    onManualEdgeRemoval: (edge: NetworkPanelEdge) => void;
}

const MachineNodeListElement = ({ selectedNode, machineNodeId, machines, onManualEdgeRemoval }: MachineNodeListElementProps): React.JSX.Element => {
    const machineUuid = getResourceUuidFromNode(machineNodeId);

    if (!machineUuid) return <></>;

    const machine = machines[machineUuid];

    return (
        <Group className={classes.container}>
            <Stack gap="0">
                <Text className={classes.label}>{machine.title}</Text>
                <Text className={classes.id}>{machine.uuid}</Text>
            </Stack>
            <ActionIcon
                ml="auto"
                color="cherry.4"
                variant="transparent"
                onClick={() => onManualEdgeRemoval({ source: machineNodeId, target: selectedNode.id } as NetworkPanelEdge)}
            >
                <IconLinkOff size={18} />
            </ActionIcon>
        </Group>
    );
};

export default MachineNodeListElement;
