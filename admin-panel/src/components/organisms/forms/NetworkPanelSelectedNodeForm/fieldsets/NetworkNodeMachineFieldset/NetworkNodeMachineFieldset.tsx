import { useDisclosure } from "@mantine/hooks";
import useNamespaceTranslation from "../../../../../../hooks/useNamespaceTranslation";
import TextFieldModal from "../../../../../../modals/base/TextFieldModal/TextFieldModal";
import { IntnetNode, MachineNode, NetworkPanelEdge, NetworkPanelNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";
import { Checkbox, Divider, Group, ScrollArea, Select, Stack, Text } from "@mantine/core";
import { IconDeviceDesktop } from "@tabler/icons-react";
import { Machine } from "../../../../../../types/api.types";
import { CLOUD_ID, getResourceUuidFromNode } from "../../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";
import BadgeGroup from "../../../../../atoms/display/BadgeGroup/BadgeGroup";
import _ from "lodash";
import AccountAvatarGroup from "../../../../../atoms/display/AccountAvatarGroup/AccountAvatarGroup";
import BusinessCard from "../../../../../atoms/display/BusinessCard/BusinessCard";
import { getFullUserName } from "../../../../../../utils/users";
import { Edge } from "@xyflow/react";
import { ChangeEvent } from "react";
import classes from "../../NetworkPanelSelectedNodeForm.module.css";
import SelectNodeRenderOption from "../../SelectNodeRenderOption";
import IntnetNodeListElement from "../../node-list-elements/IntnetNodeListElement/IntnetNodeListElement";

export interface NetworkNodeMachineFieldsetProps {
    nodes: NetworkPanelNode[];
    edges: Edge[];
    selectedNode: MachineNode;
    machines: Record<string, Machine>;
    onManualIntnetCreation: (name: string, selectedMachineNode: MachineNode) => void;
    onManualEdgeRemoval: (edge: NetworkPanelEdge) => void;
    onManualEdgeCreation: (edge: NetworkPanelEdge) => void;
}

const NetworkNodeMachineFieldset = ({
    nodes,
    edges,
    onManualIntnetCreation,
    onManualEdgeRemoval,
    onManualEdgeCreation,
    selectedNode,
    machines,
}: NetworkNodeMachineFieldsetProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "network-panel.selection-form");
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure();

    const outgoingTargets = new Set(edges.filter((e) => e.source === selectedNode.id).map((e) => e.target));

    const isConnectedToInternet = outgoingTargets.has(CLOUD_ID);
    const connectedIntnetNodes: IntnetNode[] = [];
    const notConnectedIntnetNodes: IntnetNode[] = [];

    nodes.forEach((node) => {
        if (node.type !== "intnet") return;

        if (outgoingTargets.has(node.id)) connectedIntnetNodes.push(node);
        else notConnectedIntnetNodes.push(node);
    });

    const uuid = getResourceUuidFromNode(selectedNode.id);
    const machine = uuid ? machines[uuid] : undefined;
    const assignedClients = _.values(machine?.assigned_clients);

    const onCreationValidate = (val: string) =>
        !/^[\w\s.-]+$/.test(val)
            ? tns("intnet-validation.name-invalid-characters")
            : !/[a-zA-Z]/.test(val[0])
              ? tns("intnet-validation.name-invalid-first")
              : val.length < 3
                ? tns("intnet-validation.name-too-short")
                : val.length > 50
                  ? tns("intnet-validation.name-too-long")
                  : null;

    const onCreationConfirm = (name: string) => {
        onManualIntnetCreation(name, selectedNode);
        closeModal();
    };

    const onInternetCheckboxToggle = (event: ChangeEvent<HTMLInputElement>) => {
        const edge = { source: selectedNode.id, target: CLOUD_ID } as NetworkPanelEdge;
        event.currentTarget.checked ? onManualEdgeCreation(edge) : onManualEdgeRemoval(edge);
    };

    const getSelectDataFromNode = (node: NetworkPanelNode) => ({ label: node?.data?.label ?? "Unnamed", value: node.id });

    const connectionSelectData = [...notConnectedIntnetNodes.map(getSelectDataFromNode), { value: "add-intnet", label: tns("create-new-intnet") }];

    return (
        <>
            <TextFieldModal
                opened={modalOpened}
                onCancel={closeModal}
                onConfirm={onCreationConfirm}
                onValidate={onCreationValidate}
                title={tns("creating-new-intnet")}
                initialValue="New Intnet"
                inputProps={{
                    description: tns("display-name"),
                    required: true,
                }}
            />
            <Divider
                my="xs"
                label={tns("sections.selected-machine-data")}
                labelPosition="center"
            />
            <Text className={classes.sectionText}>{t("machine-details")}</Text>
            <Group className={classes.machineDetails}>
                <IconDeviceDesktop size={32} />
                <Stack className={classes.machineTitleStack}>
                    <Text className={classes.machineTitle}>{machine?.title ?? "Unnamed Machine"}</Text>
                    <Text className={classes.machineSubtitle}>{machine?.uuid}</Text>
                </Stack>
                <Stack>
                    {machine?.tags ? (
                        <BadgeGroup
                            className={classes.machineTagsContainer}
                            badgeGroupProps={{ className: classes.badgeGroup }}
                            size="md"
                            items={machine?.tags?.sort?.((a, b) => b.length - a.length) ?? []}
                        />
                    ) : (
                        <></>
                    )}
                    <ScrollArea.Autosize mah="50px">
                        <Text className={classes.machineSubtitle}>{machine?.description}</Text>
                    </ScrollArea.Autosize>
                </Stack>
            </Group>
            {assignedClients!?.length ? (
                <>
                    <Text className={classes.sectionText}>{t("assigned-clients")}</Text>
                    {assignedClients.length > 1 ? (
                        <AccountAvatarGroup
                            users={assignedClients}
                            max={10}
                        />
                    ) : (
                        <BusinessCard
                            name={getFullUserName(assignedClients[0])}
                            comment={`@${assignedClients[0].username}`}
                            size="sm"
                        />
                    )}
                </>
            ) : (
                <></>
            )}
            <Divider
                my="xs"
                label={tns("sections.properties")}
                labelPosition="center"
            />
            <Text className={classes.sectionText}>{tns("internet-access")}</Text>
            <Checkbox
                label={tns("internet-access-description")}
                checked={isConnectedToInternet}
                onChange={onInternetCheckboxToggle}
            />
            <Text className={classes.sectionText}>{tns("internal-network-connections")}</Text>
            <ScrollArea.Autosize
                offsetScrollbars
                scrollbarSize="0.675rem"
            >
                <Stack>
                    <Select
                        placeholder={tns("add-connection")}
                        data={connectionSelectData}
                        onChange={(val) => {
                            if (val === "add-intnet") openModal();
                            else if (val) onManualEdgeCreation({ source: selectedNode.id, target: val } as NetworkPanelEdge);
                        }}
                        renderOption={SelectNodeRenderOption}
                        value={null}
                    />
                    {connectedIntnetNodes.map((node) => (
                        <IntnetNodeListElement
                            intnetNode={node}
                            onManualEdgeRemoval={onManualEdgeRemoval}
                            selectedNode={selectedNode}
                        />
                    ))}
                </Stack>
            </ScrollArea.Autosize>
        </>
    );
};
open;

export default NetworkNodeMachineFieldset;
