import { Divider, Select, Stack, StackProps } from "@mantine/core";
import classes from "./NetworkPanelSelectedNodeForm.module.css";
import {
    CloudNode,
    IntnetNode,
    MachineNode,
    NetworkPanelEdge,
    NetworkPanelNode,
} from "../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { MachinePropertiesPayload } from "../../../../types/api.types";
import NetworkNodeMachineFieldset from "./fieldsets/NetworkNodeMachineFieldset/NetworkNodeMachineFieldset";
import NetworkNodeIntnetFieldset from "./fieldsets/NetworkNodeIntnetFieldset/NetworkNodeIntnetFieldset";
import SelectNodeRenderOption from "./SelectNodeRenderOption";
import NetworkNodeInternetFieldset from "./fieldsets/NetworkNodeInternetFieldset/NetworkNodeInternetFieldset";

export interface NetworkPanelSelectedNodeFormProps extends StackProps {
    nodes: NetworkPanelNode[];
    selectedNode?: NetworkPanelNode;
    machines: Record<string, MachinePropertiesPayload>;
    edges: NetworkPanelEdge[];
    onManualSelect: (nodeId: string | null) => void;
    onManualEdgeRemoval: (edge: NetworkPanelEdge) => void;
    onManualEdgeCreation: (edge: NetworkPanelEdge) => void;
    onManualIntnetCreation: (name: string, selectedMachineNode: MachineNode) => void;
    onIntnetRename: (nodeId: string, name: string) => void;
    onIntnetRemove: (nodeId: string) => void;
}

const NetworkPanelSelectedNodeForm = ({
    onManualSelect,
    onManualEdgeRemoval,
    onManualEdgeCreation,
    onManualIntnetCreation,
    onIntnetRename,
    onIntnetRemove,
    machines,
    nodes,
    edges,
    selectedNode,
    ...props
}: NetworkPanelSelectedNodeFormProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "network-panel.selection-form");

    const getSelectDataFromNode = (node: NetworkPanelNode) => ({ label: node?.data?.label ?? "Unnamed", value: node.id });

    const formBody = selectedNode
        ? {
              machine: (
                  <NetworkNodeMachineFieldset
                      edges={edges}
                      nodes={nodes}
                      selectedNode={selectedNode as MachineNode}
                      machines={machines}
                      onManualEdgeCreation={onManualEdgeCreation}
                      onManualEdgeRemoval={onManualEdgeRemoval}
                      onManualIntnetCreation={onManualIntnetCreation}
                  />
              ),
              intnet: (
                  <NetworkNodeIntnetFieldset
                      edges={edges}
                      nodes={nodes}
                      selectedNode={selectedNode as IntnetNode}
                      machines={machines}
                      onManualEdgeCreation={onManualEdgeCreation}
                      onManualEdgeRemoval={onManualEdgeRemoval}
                      onIntnetRename={onIntnetRename}
                      onIntnetRemove={onIntnetRemove}
                  />
              ),
              cloud: (
                  <NetworkNodeInternetFieldset
                      edges={edges}
                      nodes={nodes}
                      selectedNode={selectedNode as CloudNode}
                      machines={machines}
                      onManualEdgeCreation={onManualEdgeCreation}
                      onManualEdgeRemoval={onManualEdgeRemoval}
                  />
              ),
          }[selectedNode.type]
        : undefined;

    return (
        <Stack
            {...props}
            className={classes.container}
        >
            <Divider
                my="xs"
                label={tns("sections.selected-node")}
                labelPosition="center"
            />
            <Select
                data={nodes.sort((a, b) => a.type.localeCompare(b.type)).map(getSelectDataFromNode)}
                value={selectedNode?.id}
                onChange={onManualSelect}
                allowDeselect={false}
                renderOption={SelectNodeRenderOption}
            />
            {formBody}
        </Stack>
    );
};

export default NetworkPanelSelectedNodeForm;
