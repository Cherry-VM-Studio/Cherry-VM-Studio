import { ActionIcon, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    Background,
    Connection,
    ConnectionMode,
    Controls,
    EdgeChange,
    MiniMap,
    NodeChange,
    Panel,
    ReactFlow,
    ReactFlowInstance,
    ReactFlowProvider,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "@xyflow/react/dist/style.css";
import { ERRORS } from "../../../../config/errors.config.ts";
import FloatingEdge from "../../../../components/atoms/flow-connections/Floating/FloatingEdge/FloatingEdge.jsx";
import NumberAllocator from "../../../../handlers/numberAllocator.ts";
import useErrorHandler from "../../../../hooks/useErrorHandler.ts";
import useMantineNotifications from "../../../../hooks/useMantineNotifications.tsx";
import useApi from "../../../../hooks/useApi.ts";
import useFetch from "../../../../hooks/useFetch.ts";
import Prompt from "../../../../modals/base/Prompt/Prompt.jsx";
import FlowPanel from "../../../../components/organisms/interactive/FlowPanel/FlowPanel.tsx";
import FloatingConnectionLine from "../../../../components/atoms/flow-connections/Floating/FloatingConnectionLine/FloatingConnectionLine.jsx";
import {
    calcMiddlePosition,
    CLOUD_ID,
    generateCloudNodeObject,
    generateIntnetNodeObject,
    generateNodeObject,
    getNodeId,
    getResourceTypeFromNode,
    getResourceUuidFromNode,
} from "./reactFlow.ts";
import _ from "lodash";
import MachineNode from "../../../../components/atoms/flow-nodes/MachineNode/MachineNode.tsx";
import IntnetNode from "../../../../components/atoms/flow-nodes/IntnetNode/IntnetNode.tsx";
import { isAxiosError } from "axios";
import { useProfile } from "../../../../contexts/ProfileContext.tsx";
import CloudNode from "../../../../components/atoms/flow-nodes/CloudNode/CloudNode.tsx";
import { InternalNetwork, InternalNetworkSetForm, NetworkConfiguration, NetworkConfigurationSetForm } from "../../../../types/api.types.ts";
import PositionAllocator from "../../../../handlers/positionAllocator.ts";
import "./NetworkPanelPage.module.css";
import NetworkPanelSelectedNodeForm from "../../../../components/organisms/forms/NetworkPanelSelectedNodeForm/NetworkPanelSelectedNodeForm.tsx";
import { NetworkPanelEdge, NetworkPanelNode, NodeDataMap, Position } from "./reactFlow.types.ts";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronsLeft, IconTool, IconTools } from "@tabler/icons-react";

const NODE_TYPES = {
    machine: MachineNode,
    intnet: IntnetNode,
    cloud: CloudNode,
};

const EDGE_TYPES = {
    floating: FloatingEdge,
};

const DEFAULT_EDGE_OPTIONS = {
    deletable: true,
    selectable: true,
    type: "floating",
};

/**
 * Main component for managing the network flow visualization.
 * Handles nodes, edges, configurations, snapshots, and presets.
 */
const Flow = (): JSX.Element => {
    const { handleAxiosError } = useErrorHandler();
    const { sendNotification, sendErrorNotification } = useMantineNotifications();
    const { getNode, getEdges, zoomTo, getZoom, setCenter } = useReactFlow();
    const { sendRequest } = useApi();
    const { getProfile } = useProfile();

    const [selectedAccountUuid, setSelectedAccountUuid] = useState(getProfile().uuid);
    const [nodes, setNodes] = useState<NetworkPanelNode[]>([]);
    const [edges, setEdges] = useState<NetworkPanelEdge[]>([]);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance<NetworkPanelNode, NetworkPanelEdge> | null>(null);

    const pageLoaded = useRef(false);
    const intnetAllocator = useRef(new NumberAllocator()).current;
    const positionsAllocator = useRef(new PositionAllocator()).current;

    const selectedNode = nodes.find((n) => n.selected);

    // returns the suffix number if the intnet has a default display name, else returns null
    const getIntnetNumber = (displayName: string) => +(/^Intnet\s+(\d+)$/.exec(displayName)?.[1] ?? NaN) || null;

    /**
     * [isDirty]
     * true - unsaved changes
     * false - no unsaved changes
     * null - no unsaved changes and just loaded
     */
    const [isDirty, setIsDirty] = useState<boolean | null>(null);

    const PATHS = {
        machines: selectedAccountUuid ? `/machines/account/${selectedAccountUuid}` : `/machines/account`,
        getWorkspace: selectedAccountUuid ? `/network/workspace/${selectedAccountUuid}` : `/network/workspace`,
        putPositions: selectedAccountUuid ? `/network/configuration/positions/${selectedAccountUuid}` : `/network/configuration/positions`,
        putConfiguration: selectedAccountUuid ? `/network/configuration/networks/${selectedAccountUuid}` : `/network/configuration/networks`,
    } as const;

    const { error: machinesError, data: machines, refresh: refreshMachines } = useFetch(PATHS.machines);

    // adds new nodes to the flow
    const addNodes = (...nodes: NetworkPanelNode[]) => setNodes((nds) => [...nds, ...nodes.flat()]);

    // adds an edge between nodes in the flow
    const addEdgeToFlow = (edge: NetworkPanelEdge) => {
        setEdges((eds) => addEdge(edge, eds));
        setIsDirty(true);
    };

    /**
     * Handles changes to nodes in the flow.
     * Marks the flow as unsaved (dirty) if changes are made.
     */
    const onNodesChange = useCallback((changes: NodeChange<NetworkPanelNode>[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
        if (changes && !changes.every((e) => e.type === "dimensions")) setIsDirty(true);
    }, []);

    /**
     * Handles the deletion of nodes from the flow.
     * When deleting an intnet node, removes the intnet number from the allocator,
     * allowing for future intnets to use its number.
     * No need to mark the flow as unsaved - on node deletion the function above, onNodesChange, also runs and it handles it already.
     */
    const onNodesDelete = useCallback(
        (deletedNodes: NetworkPanelNode[]) =>
            deletedNodes.forEach((node) => {
                if (node.type !== "intnet") return;

                // checks if the intnet node has a default name and extracts the number suffix
                const number = getIntnetNumber(node.data.label);

                // removes the number suffix of the deleted node
                if (!_.isNull(number)) intnetAllocator.remove(number);
            }),
        [],
    );

    /**
     * Handles changes to edges in the flow.
     * Marks the flow as unsaved (dirty).
     */
    const onEdgesChange = useCallback((changes: EdgeChange<NetworkPanelEdge>[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
        setIsDirty(true);
    }, []);

    /**
     * Handles connection events between nodes.
     * When connecting a machine to another machine, it automatically creates a new internal network between them.
     */
    const onNodesConnect = useCallback(
        (connection: Connection) => {
            const { source, target } = connection;

            if (source.startsWith("intnet") || source.startsWith("cloud")) {
                return console.warn("Somehow the user managed to create a connection between intnets/cloud.", connection);
            }

            // connection started from a machine node and ending on a intnet/cloud node.
            if (target.startsWith("intnet") || target.startsWith("cloud")) {
                return addEdgeToFlow({ source: source, target: target } as NetworkPanelEdge);
            }

            // connection between two machine nodes
            // new intnet is created
            const intnet = { uuid: uuidv4(), intnet_name: `Intnet ${intnetAllocator.getNext()}`, bridge_ip: null, machines: [] } as InternalNetworkSetForm;
            const intnetPosition = calcMiddlePosition(getNode(source)!.position, getNode(target)!.position) as Position;
            const intnetNode = generateIntnetNodeObject(intnet, intnetPosition);

            addNodes(intnetNode);
            addEdgeToFlow({ source: target, target: intnetNode.id } as NetworkPanelEdge);
            addEdgeToFlow({ source: source, target: intnetNode.id } as NetworkPanelEdge);
        },
        [setEdges],
    );

    const onManualSelect = (nodeId: string | null) => {
        setNodes((nodes) => nodes.map((node) => ({ ...node, selected: node.id === nodeId })));

        const selected = nodes.find((node) => node.id === nodeId);

        if (!selected) return;

        setCenter(selected.position.x + 50, selected.position.y + 50);
        zoomTo(getZoom() - 0.5, { duration: 500 });
    };

    const onManualEdgeRemoval = ({ source, target }: NetworkPanelEdge) => {
        setEdges((edges) => edges.filter((e) => e.source !== source || e.target !== target));
    };

    const onManualIntnetCreation = (name: string, connectedNode: NetworkPanelNode) => {
        const intnet = { uuid: uuidv4(), intnet_name: name, bridge_ip: null, machines: [] } as InternalNetworkSetForm;
        const intnetNode = generateIntnetNodeObject(intnet, positionsAllocator.getNext());
        addNodes(intnetNode);
        addEdgeToFlow({ source: connectedNode.id, target: intnetNode.id } as NetworkPanelEdge);
    };

    const onIntnetRename = (nodeId: string, name: string) => {
        if (getResourceTypeFromNode(nodeId) !== "intnet") return;
        setNodes((prev) => prev.map((node) => (node.id === nodeId ? _.merge({}, node, { data: { label: name } }) : node)));
    };

    const onIntnetRemove = (nodeId: string) => {
        if (getResourceTypeFromNode(nodeId) !== "intnet") return;
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    };

    const getNodePositions = useCallback(() => rfInstance?.getNodes().reduce((acc, node) => ({ ...acc, [node.id]: node.position }), {}) ?? {}, [rfInstance]);

    const getNetworksConfig = (): NetworkConfigurationSetForm => {
        const edges = getEdges();
        const intnets: Record<string, InternalNetworkSetForm> = {};
        const machinesWithInternetAccess: string[] = [];

        edges.forEach(({ source, target, data }) => {
            const machineUuid = getResourceUuidFromNode(source);

            if (!source.startsWith("machine") || _.isNull(machineUuid)) return;

            if (target.startsWith(CLOUD_ID)) return machinesWithInternetAccess.push(machineUuid);
            if (!target.startsWith("intnet")) return;

            const intnetUuid = getResourceUuidFromNode(target);
            const intnetNode = nodes.find((n) => n.id === target);

            if (_.isNull(intnetUuid) || !intnetNode) return;

            if (!intnets[intnetUuid]) {
                intnets[intnetUuid] = {
                    uuid: intnetUuid,
                    machines: [],
                    intnet_name: intnetNode.data.label,
                    bridge_ip: null,
                };
            }

            intnets[intnetUuid].machines.push(machineUuid);
        });

        return {
            internal_networks: intnets,
            machines_with_internet_access: machinesWithInternetAccess,
        };
    };

    // Creates nodes of provided type and data.
    const createFlowNodes = <T extends keyof NodeDataMap>(nodeType: T, data: NodeDataMap[T][], positions: Record<string, Position>) => {
        if (_.isEmpty(data)) return;

        const getPos = (uuid: string) => positions[getNodeId(nodeType, uuid)] ?? positionsAllocator.getNext();

        addNodes(...data.map((node) => generateNodeObject(nodeType, node, getPos(nodeType === "cloud" ? "" : node!.uuid)) as NetworkPanelNode));
    };

    const createCloudNode = (positions: Record<string, Position>) => {
        const pos = positions["cloud:::"] ?? { x: 150, y: -250 };
        addNodes(generateCloudNodeObject(pos));
    };

    // Creates nodes representing virtual machines.
    const createMachineNodes = (positions: Record<string, Position>) => createFlowNodes("machine", _.values(machines), positions);

    // Creates edges between machine nodes and intnet nodes based on the intnet configuration.
    const createIntnetEdges = (intnets: InternalNetwork[]) => {
        if (_.isEmpty(intnets)) return;

        intnets.forEach(({ uuid, machines }) =>
            _.entries(machines)?.forEach?.(([machineUuid, interfaceMac]) => {
                addEdgeToFlow({
                    source: getNodeId("machine", machineUuid),
                    target: getNodeId("intnet", uuid),
                    data: { interfaceMac },
                } as NetworkPanelEdge);
            }),
        );
    };

    // Creates edges between machine nodes and the cloud node
    const createInternetEdges = (machineUuids: string[]) => {
        if (_.isEmpty(machineUuids)) return;

        machineUuids.forEach((machineUuid) => {
            addEdgeToFlow({
                source: getNodeId("machine", machineUuid),
                target: CLOUD_ID,
            } as NetworkPanelEdge);
        });
    };

    // Loads flow based on the provided positions and intnets data.
    const loadFlowWithIntnets = async (positions: Record<string, Position>, configuration: NetworkConfiguration) => {
        return new Promise<void>(async (resolve, reject) => {
            if (!positions || !configuration) return reject("Either positions or intnets is undefined.");

            const intnetsArray = _.values(configuration.internal_networks).filter((intnet) => _.size(intnet.machines) > 1);
            const internetArray = configuration.machines_with_internet_access;

            positionsAllocator.setBounds(_.values(positions));

            setNodes([]);
            setEdges([]);

            createCloudNode(positions);
            createMachineNodes(positions);
            createFlowNodes("intnet", intnetsArray, positions);
            createIntnetEdges(intnetsArray);
            createInternetEdges(internetArray);

            const takenIntnetNumbers = intnetsArray.map((intnet) => getIntnetNumber(intnet.intnet_name)).filter((e) => !_.isNull(e));

            intnetAllocator.setCurrent(Math.max(...takenIntnetNumbers, 0));

            resolve();
        });
    };

    // Resets the flow to the current network configuration from the backend.
    const resetFlow = async () => {
        const { configuration, positions } = await sendRequest("GET", PATHS.getWorkspace);
        return loadFlowWithIntnets(positions, configuration);
    };

    // Initializes the flow by resetting it and loading the network configuration.
    const initFlow = useCallback(() => {
        if (!machines) return;
        resetFlow()
            .then(() => {
                pageLoaded.current = true;
                notifications.hide(`network-panel.flow-init`);
                sendNotification("network-panel.flow-init", { color: "suse-green", uniqueId: false });
                setIsDirty(null);
            })
            .catch(() => sendErrorNotification(ERRORS.CVMM_650_INVALID_NETWORK_CONFIGURATION));
    }, [resetFlow]);

    const centerFlow = () => {
        const center = calcMiddlePosition(...nodes.map((n) => n.position as Position));

        // adding half the node width
        if (center) setCenter(center.x + 50, center.y + 50);
        zoomTo(getZoom() - 0.5, { duration: 500 });
    };

    // Sends a PUT request to save the current flow panel state.
    const putNodePositions = () => sendRequest("PUT", PATHS.putPositions, { data: getNodePositions() });

    // Sends a PUT request to save the internal network (Intnet) configuration.
    const putIntnetConfiguration = () => sendRequest("PUT", PATHS.putConfiguration, { data: getNetworksConfig() });

    // Saves the current flow state and internal network (Intnet) configuration.
    const applyNetworkConfig = async () => {
        const stateResponse = await putNodePositions();
        const networkConfigResponse = await putIntnetConfiguration();

        if (!isAxiosError(stateResponse)) sendNotification("network-panel.state-saved");
        if (!isAxiosError(networkConfigResponse)) sendNotification("network-panel.config-saved");

        setIsDirty(false);
    };

    useEffect(initFlow, [machines]);

    useEffect(centerFlow, [pageLoaded.current]);

    if (machinesError) {
        handleAxiosError(machinesError);
        return <></>;
    }

    return (
        <>
            <Prompt when={isDirty ?? false} />
            <Group
                flex="1"
                gap="0"
            >
                <ReactFlow
                    connectOnClick={false}
                    colorMode="dark"
                    connectionMode={ConnectionMode.Loose}
                    onInit={setRfInstance}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onNodesDelete={onNodesDelete}
                    onEdgesChange={onEdgesChange}
                    onConnect={onNodesConnect}
                    nodeTypes={NODE_TYPES}
                    // @ts-ignore
                    edgeTypes={EDGE_TYPES}
                    defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
                    connectionLineComponent={FloatingConnectionLine}
                    style={{
                        flex: 4,
                    }}
                >
                    <FlowPanel
                        refreshMachines={refreshMachines}
                        applyNetworkConfig={applyNetworkConfig}
                        resetFlow={resetFlow}
                        isDirty={isDirty}
                        selectedAccountUuid={selectedAccountUuid}
                        setSelectedAccountUuid={setSelectedAccountUuid}
                    />
                    <Controls />
                    <MiniMap
                        nodeStrokeWidth={3}
                        pannable
                        zoomable
                    />
                    <Background />
                </ReactFlow>
                <NetworkPanelSelectedNodeForm
                    flex={1}
                    display={selectedNode ? undefined : "none"}
                    selectedNode={selectedNode}
                    nodes={nodes}
                    edges={edges}
                    machines={machines}
                    onManualSelect={onManualSelect}
                    onManualEdgeRemoval={onManualEdgeRemoval}
                    onManualEdgeCreation={addEdgeToFlow}
                    onManualIntnetCreation={onManualIntnetCreation}
                    onIntnetRename={onIntnetRename}
                    onIntnetRemove={onIntnetRemove}
                />
            </Group>
        </>
    );
};

export default function NetworkPanelPage() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}
