import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconLinkOff } from "@tabler/icons-react";
import classes from "../ListElements.module.css";
import { ExpandedNetworkPanelEdge, NetworkPanelEdge, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import { useTranslation } from "react-i18next";

export interface MachineNodeListElementProps {
    selectedNode: NetworkPanelNode;
    expandedEdge: ExpandedNetworkPanelEdge;

    onManualEdgeRemoval: (edge: NetworkPanelEdge) => void;
}

const MachineNodeListElement = ({ selectedNode, expandedEdge, onManualEdgeRemoval }: MachineNodeListElementProps): React.JSX.Element => {
    const { t } = useTranslation();
    const MachineIcon = expandedEdge.source.data.icon;

    return (
        <Group className={classes.container}>
            <Stack gap="0">
                <Group
                    gap="4"
                    pb="4"
                >
                    <MachineIcon size={18} />
                    <Text className={classes.label}>{expandedEdge.source.data.label}</Text>
                </Group>
                <Text className={classes.infoField}>UUID: {expandedEdge.source.data.uuid}</Text>
                <Text className={classes.infoField}>MAC: {expandedEdge.data?.interfaceMac ?? t("unknown")}</Text>
                <Text className={classes.infoField}>IP: {expandedEdge.data?.interfaceIp ?? t("unknown")}</Text>
            </Stack>
            <ActionIcon
                ml="auto"
                color="cherry.4"
                variant="transparent"
                onClick={() => onManualEdgeRemoval({ source: expandedEdge.source.id, target: selectedNode.id } as NetworkPanelEdge)}
            >
                <IconLinkOff size={18} />
            </ActionIcon>
        </Group>
    );
};

export default MachineNodeListElement;
