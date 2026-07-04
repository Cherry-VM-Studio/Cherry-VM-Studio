import { Divider, ScrollArea, Select, Stack, Text } from "@mantine/core";
import useNamespaceTranslation from "../../../../../../hooks/useNamespaceTranslation";
import classes from "../../NetworkPanelSelectedNodeForm.module.css";
import MachineNodeListElement from "../../node-list-elements/MachineNodeListElement/MachineNodeListElement";
import { CloudNode, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import { Edge } from "@xyflow/react";
import { Machine } from "../../../../../../types/api.types";
import { getResourceTypeFromNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";
import SelectNodeRenderOption from "../../SelectNodeRenderOption";

export interface NetworkNodeInternetFieldsetProps {
    nodes: NetworkPanelNode[];
    edges: Edge[];
    selectedNode: CloudNode;
    machines: Record<string, Machine>;
    onManualEdgeRemoval: (edge: Edge) => void;
    onManualEdgeCreation: (edge: Edge) => void;
}

const NetworkNodeInternetFieldset = ({
    nodes,
    edges,
    selectedNode,
    machines,
    onManualEdgeCreation,
    onManualEdgeRemoval,
}: NetworkNodeInternetFieldsetProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "network-panel.selection-form");

    const connectedMachineNodeIds = edges.filter((e) => e.target === selectedNode.id && getResourceTypeFromNode(e.source) === "machine").map((e) => e.source);
    const connectedMachineNodeIdsSet = new Set(connectedMachineNodeIds);

    const getSelectDataFromNode = (node: NetworkPanelNode) => ({ label: node?.data?.label ?? "Unnamed", value: node.id });

    const addConnectionSelectData = nodes.filter((n) => n.type === "machine" && !connectedMachineNodeIdsSet.has(n.id)).map(getSelectDataFromNode);

    return (
        <>
            <Divider
                my="xs"
                label={tns("connected-machines")}
                labelPosition="center"
            />
            <Text className={classes.sectionText}>{tns("connected-machines")}</Text>
            <ScrollArea.Autosize
                offsetScrollbars
                scrollbarSize="0.675rem"
            >
                <Stack>
                    <Select
                        placeholder={tns("add-connection")}
                        data={addConnectionSelectData}
                        onChange={(val) => onManualEdgeCreation({ source: val, target: selectedNode.id } as Edge)}
                        renderOption={SelectNodeRenderOption}
                        value={null}
                    />
                    {connectedMachineNodeIds.map((id) => (
                        <MachineNodeListElement
                            machineNodeId={id}
                            machines={machines}
                            onManualEdgeRemoval={onManualEdgeRemoval}
                            selectedNode={selectedNode}
                        />
                    ))}
                </Stack>
            </ScrollArea.Autosize>
        </>
    );
};

export default NetworkNodeInternetFieldset;
