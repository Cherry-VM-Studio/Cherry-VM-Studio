import { Button, Divider, Group, Loader, ScrollArea, Select, Stack, Text, TextInput } from "@mantine/core";
import classes from "../../NetworkPanelSelectedNodeForm.module.css";
import useNamespaceTranslation from "../../../../../../hooks/useNamespaceTranslation";
import { IntnetNode, MachineNode, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import { Edge } from "@xyflow/react";
import { getResourceTypeFromNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";
import { Machine } from "../../../../../../types/api.types";
import SelectNodeRenderOption from "../../SelectNodeRenderOption";
import { useField } from "@mantine/form";
import MachineNodeListElement from "../../node-list-elements/MachineNodeListElement/MachineNodeListElement";
import { useEffect, useState } from "react";
import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import ConfirmationModal from "../../../../../../modals/base/ConfirmationModal/ConfirmationModal";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import DebouncedTextInput from "../../../../../atoms/interactive/DebouncedTextInput/DebouncedTextInput";

export interface NetworkNodeIntnetFieldsetProps {
    nodes: NetworkPanelNode[];
    edges: Edge[];
    selectedNode: IntnetNode;
    machines: Record<string, Machine>;
    onManualEdgeRemoval: (edge: Edge) => void;
    onManualEdgeCreation: (edge: Edge) => void;
    onIntnetRename: (nodeId: string, newName: string) => void;
    onIntnetRemove: (nodeId: string) => void;
}

const NetworkNodeIntnetFieldset = ({
    nodes,
    edges,
    selectedNode,
    machines,
    onManualEdgeRemoval,
    onManualEdgeCreation,
    onIntnetRename,
    onIntnetRemove,
}: NetworkNodeIntnetFieldsetProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "network-panel.selection-form");

    // for the removal confirmation modal
    const [opened, { open, close }] = useDisclosure();

    const connectedMachineNodeIds = edges.filter((e) => e.target === selectedNode.id && getResourceTypeFromNode(e.source) === "machine").map((e) => e.source);
    const connectedMachineNodeIdsSet = new Set(connectedMachineNodeIds);

    const getSelectDataFromNode = (node: NetworkPanelNode) => ({ label: node?.data?.label ?? "Unnamed", value: node.id });

    const addConnectionSelectData = nodes.filter((n) => n.type === "machine" && !connectedMachineNodeIdsSet.has(n.id)).map(getSelectDataFromNode);

    const nameValidate = (val: string) =>
        val.length < 3
            ? tns("intnet-validation.name-too-short")
            : val.length > 50
              ? tns("intnet-validation.name-too-long")
              : !/^[\w\s.-]+$/.test(val)
                ? tns("intnet-validation.name-invalid-characters")
                : !/[a-zA-Z]/.test(val[0])
                  ? tns("intnet-validation.name-invalid-first")
                  : null;

    return (
        <>
            <ConfirmationModal
                opened={opened}
                onClose={close}
                onConfirm={() => onIntnetRemove(selectedNode.id)}
                title={tns("intnet-removal.title")}
                message={tns("intnet-removal.description")}
            />
            <Divider
                my="xs"
                label={tns("sections.properties")}
                labelPosition="center"
            />
            <Text className={classes.sectionText}>{tns("display-name")}</Text>
            <Group>
                <DebouncedTextInput
                    initialValue={selectedNode.data.label}
                    onChange={(val) => onIntnetRename(selectedNode.id, val)}
                    validate={nameValidate}
                    resetTrigger={selectedNode.id}
                />
            </Group>
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
            <Button
                mt="auto"
                variant="light"
                maw="180"
                mih="36"
                onClick={() => open()}
            >
                <Group gap="4">
                    <IconTrash
                        size={18}
                        stroke={2.5}
                    />
                    {tns("delete-intnet")}
                </Group>
            </Button>
        </>
    );
};

export default NetworkNodeIntnetFieldset;
