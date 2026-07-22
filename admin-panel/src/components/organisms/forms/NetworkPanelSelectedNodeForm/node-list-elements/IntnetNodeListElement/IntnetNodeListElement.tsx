import { ActionIcon, Divider, Group, Stack, Text } from "@mantine/core";
import { IconLinkOff, IconPlugConnected, IconTopologyStar3 } from "@tabler/icons-react";
import classes from "../ListElements.module.css";
import { ExpandedNetworkPanelEdge, NetworkPanelEdge, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import { getResourceUuidFromNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";
import { useTranslation } from "react-i18next";

export interface IntnetNodeListElementProps {
    selectedNode: NetworkPanelNode;
    expandedEdge: ExpandedNetworkPanelEdge;
    onManualEdgeRemoval: (edge: NetworkPanelEdge) => void;
}

const IntnetNodeListElement = ({ selectedNode, expandedEdge, onManualEdgeRemoval }: IntnetNodeListElementProps): React.JSX.Element => {
    const { t } = useTranslation();
    return (
        <Group className={classes.container}>
            <Stack gap="0">
                <Group
                    gap="4"
                    pb="4"
                >
                    <IconTopologyStar3 size={18} />
                    <Text className={classes.label}>{expandedEdge.target.data.label}</Text>
                </Group>
                <Text className={classes.infoField}>UUID: {expandedEdge.target.data.uuid ?? t("unknown")}</Text>
                <Text className={classes.infoField}>MAC: {expandedEdge.target.data.mac ?? t("unknown")}</Text>
                <Text className={classes.infoField}>IP: {expandedEdge.target.data.bridgeIp ?? t("unknown")}</Text>
                <Divider
                    w="100%"
                    mt="xs"
                    mb="xs"
                />
                <Group
                    gap="4"
                    pb="4"
                >
                    <IconPlugConnected size={18} />
                    <Text className={classes.label}>{t("interface")}</Text>
                </Group>
                <Text className={classes.infoField}>MAC: {expandedEdge.data?.interfaceMac ?? t("unknown")}</Text>
                <Text className={classes.infoField}>IP: {expandedEdge.data?.interfaceIp ?? t("unknown")}</Text>
            </Stack>
            <ActionIcon
                ml="auto"
                color="cherry.4"
                variant="transparent"
                onClick={() => onManualEdgeRemoval({ source: selectedNode.id, target: expandedEdge.target.id } as NetworkPanelEdge)}
            >
                <IconLinkOff size={18} />
            </ActionIcon>
        </Group>
    );
};

export default IntnetNodeListElement;
