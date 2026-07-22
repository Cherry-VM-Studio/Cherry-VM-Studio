import { ActionIcon, Button, Divider, Group, MaskInput, ScrollArea, Select, Stack, Text, TextInput } from "@mantine/core";
import classes from "../../NetworkPanelSelectedNodeForm.module.css";
import useNamespaceTranslation from "../../../../../../hooks/useNamespaceTranslation";
import { IntnetNode, NetworkPanelEdge, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import { getResourceTypeFromNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";
import { MachinePropertiesPayload } from "../../../../../../types/api.types";
import SelectNodeRenderOption from "../../SelectNodeRenderOption";
import MachineNodeListElement from "../../node-list-elements/MachineNodeListElement/MachineNodeListElement";
import { IconLock, IconTrash } from "@tabler/icons-react";
import ConfirmationModal from "../../../../../../modals/base/ConfirmationModal/ConfirmationModal";
import { useDisclosure } from "@mantine/hooks";
import DebouncedTextInput from "../../../../../atoms/interactive/DebouncedTextInput/DebouncedTextInput";
import { useState } from "react";
import _ from "lodash";

export interface NetworkNodeIntnetFieldsetProps {
    nodes: NetworkPanelNode[];
    edges: NetworkPanelEdge[];
    selectedNode: IntnetNode;
    machines: Record<string, MachinePropertiesPayload>;
    onManualEdgeRemoval: (edge: NetworkPanelEdge) => void;
    onManualEdgeCreation: (edge: NetworkPanelEdge) => void;
    onIntnetRename: (nodeId: string, newName: string) => void;
    onIntnetRemove: (nodeId: string) => void;
    onIntnetIpChange: (nodeId: string, newIp: string) => void;
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
    onIntnetIpChange,
}: NetworkNodeIntnetFieldsetProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "network-panel.selection-form");

    // for the removal confirmation modal
    const [opened, { open, close }] = useDisclosure();

    const bridgeIp = selectedNode.data.bridgeIp === "0.0.0.0/32" ? "" : (selectedNode.data.bridgeIp ?? "");

    const connectedMachineNodeIds = edges.filter((e) => e.target === selectedNode.id && getResourceTypeFromNode(e.source) === "machine").map((e) => e.source);
    const connectedMachineNodeIdsSet = new Set(connectedMachineNodeIds);

    const getSelectDataFromNode = (node: NetworkPanelNode) => ({ label: node?.data?.label ?? "Unnamed", value: node.id });

    const addConnectionSelectData = nodes.filter((n) => n.type === "machine" && !connectedMachineNodeIdsSet.has(n.id)).map(getSelectDataFromNode);

    const validateName = (val: string) =>
        val.length < 3
            ? tns("intnet-validation.name-too-short")
            : val.length > 50
              ? tns("intnet-validation.name-too-long")
              : !/^[\w\s.-]+$/.test(val)
                ? tns("intnet-validation.name-invalid-characters")
                : !/[a-zA-Z]/.test(val[0])
                  ? tns("intnet-validation.name-invalid-first")
                  : null;

    // for "xxx.xxx.xxx.xxx/mm"
    const validateIpAddress = (val: string) => {
        if (!val.length) return null;

        const [address, mask, ...rest] = val.split("/");

        // invalid string
        if (rest?.length || !address || !mask) return tns("intnet-validation.invalid-ip-address");

        const octets = address.split(".");

        // invalid number of octets
        if (octets.length !== 4) return tns("intnet-validation.invalid-ip-address");

        // invalid octets format
        octets.forEach((octet) => {
            const match = /^0*(\d+)$/.exec(octet);
            if (!match || !_.inRange(Number(match[1]), 0, 256)) return tns("intnet-validation.invalid-ip-address");
        });

        // invalid mask
        if (!/^\d{1,2}$/.test(mask) || !_.inRange(Number(mask), 8, 31)) return tns("intnet-validation.invalid-ip-address-mask");

        // reserved ranges
        if (Number(octets[0]) === 0) return tns("intnet-validation.ip-reserved-range-0");
        if (Number(octets[0]) === 127) return tns("intnet-validation.ip-reserved-range-127");

        return null;
    };

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
            <Text className={classes.fieldText}>{tns("mac-address")}</Text>
            <TextInput
                readOnly
                value={selectedNode.data.mac}
                rightSection={<IconLock size={16} />}
            />
            <Text className={classes.fieldText}>{tns("bridge-ip-address")}</Text>
            <Group
                wrap="nowrap"
                gap="0"
                align="start"
            >
                <DebouncedTextInput
                    initialValue={bridgeIp}
                    onChange={(val) => onIntnetIpChange(selectedNode.id, val)}
                    validate={validateIpAddress}
                    resetTrigger={bridgeIp}
                    placeholder="XXX.XXX.XXX.XXX/XX"
                    styles={{ input: { borderRadius: "var(--mantine-radius-md) 0 0 var(--mantine-radius-md)" } }}
                    flex="1"
                />
                <ActionIcon
                    onClick={(_) => onIntnetIpChange(selectedNode.id, "0.0.0.0/32")}
                    size="input-sm"
                    variant="default"
                    style={{ borderRadius: "0 var(--mantine-radius-md) var(--mantine-radius-md) 0", borderLeft: "none" }}
                >
                    <IconTrash size={18} />
                </ActionIcon>
            </Group>
            <Text className={classes.fieldText}>{tns("display-name")}</Text>
            <DebouncedTextInput
                initialValue={selectedNode.data.label}
                onChange={(val) => onIntnetRename(selectedNode.id, val)}
                validate={validateName}
                resetTrigger={selectedNode.id}
            />
            <Divider
                my="xs"
                label={tns("sections.connected-machines")}
                labelPosition="center"
            />
            <ScrollArea.Autosize
                offsetScrollbars
                scrollbarSize="0.675rem"
            >
                <Stack>
                    <Select
                        placeholder={tns("add-connection")}
                        data={addConnectionSelectData}
                        onChange={(val) => onManualEdgeCreation({ source: val, target: selectedNode.id } as NetworkPanelEdge)}
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
