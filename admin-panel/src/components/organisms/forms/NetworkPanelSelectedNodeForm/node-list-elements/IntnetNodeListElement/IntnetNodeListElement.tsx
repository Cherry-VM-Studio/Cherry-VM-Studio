import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconLinkOff } from "@tabler/icons-react";
import classes from "../ListElements.module.css";
import { IntnetNode, NetworkPanelEdge, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import { getResourceUuidFromNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";

export interface IntnetNodeListElementProps {
    selectedNode: NetworkPanelNode;
    intnetNode: IntnetNode;
    onManualEdgeRemoval: (edge: NetworkPanelEdge) => void;
}

const IntnetNodeListElement = ({ selectedNode, intnetNode, onManualEdgeRemoval }: IntnetNodeListElementProps): React.JSX.Element => {
    return (
        <Group className={classes.container}>
            <Stack gap="0">
                <Text className={classes.label}>{intnetNode.data.label}</Text>
                <Text className={classes.id}>{getResourceUuidFromNode(intnetNode.id)}</Text>
            </Stack>
            <ActionIcon
                ml="auto"
                color="cherry.4"
                variant="transparent"
                onClick={() => onManualEdgeRemoval({ source: selectedNode.id, target: intnetNode.id } as NetworkPanelEdge)}
            >
                <IconLinkOff size={18} />
            </ActionIcon>
        </Group>
    );
};

export default IntnetNodeListElement;
