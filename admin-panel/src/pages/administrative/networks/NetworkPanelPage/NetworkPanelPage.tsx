import { Container } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    Background,
    Connection,
    ConnectionMode,
    Controls,
    Edge,
    EdgeChange,
    MiniMap,
    NodeChange,
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
    getResourceUuidFromNode,
} from "./reactFlow.ts";
import { NetworkPanelNode, NodeDataMap, Position } from "./reactFlow.types.ts";
import _ from "lodash";
import MachineNode from "../../../../components/atoms/flow-nodes/MachineNode/MachineNode.tsx";
import IntnetNode from "../../../../components/atoms/flow-nodes/IntnetNode/IntnetNode.tsx";
import { isAxiosError } from "axios";
import { useProfile } from "../../../../contexts/ProfileContext.tsx";
import CloudNode from "../../../../components/atoms/flow-nodes/CloudNode/CloudNode.tsx";
import { InternalNetwork, NetworkConfiguration } from "../../../../types/api.types.ts";
import PositionAllocator from "../../../../handlers/positionAllocator.ts";

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
    const [edges, setEdges] = useState<Edge[]>([]);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance<NetworkPanelNode, Edge> | null>(null);

    const initCount = useRef(0);
    const intnetAllocator = useRef(new NumberAllocator()).current;
    const positionsAllocator = useRef(new PositionAllocator()).current;

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
        machines: `/machines/account/${selectedAccountUuid ?? ""}`,
        getWorkspace: `/network/workspace/${selectedAccountUuid ?? ""}`,
        putPositions: `/network/configuration/positions/${selectedAccountUuid ?? ""}`,
        putConfiguration: `/network/configuration/networks/${selectedAccountUuid ?? ""}`,
    } as const;

    const { error: machinesError, data: machines, refresh: refreshMachines } = useFetch(PATHS.machines);

    // adds new nodes to the flow
    const addNodes = (...nodes: NetworkPanelNode[]) => setNodes((nds) => [...nds, ...nodes.flat()]);

    // adds an edge between nodes in the flow
    const addEdgeToFlow = (edge: Edge) => {
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
    const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
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
                return addEdgeToFlow({ source: source, target: target } as Edge);
            }

            // connection between two machine nodes
            // new intnet is created
            const intnet = { uuid: uuidv4(), display_name: `Intnet ${intnetAllocator.getNext()}` } as InternalNetwork;
            const intnetPosition = calcMiddlePosition(getNode(source)!.position, getNode(target)!.position) as Position;
            const intnetNode = generateIntnetNodeObject(intnet, intnetPosition);

            addNodes(intnetNode);
            addEdgeToFlow({ source: target, target: intnetNode.id } as Edge);
            addEdgeToFlow({ source: source, target: intnetNode.id } as Edge);
        },
        [setEdges],
    );

    const getNodePositions = useCallback(() => rfInstance?.getNodes().reduce((acc, node) => ({ ...acc, [node.id]: node.position }), {}) ?? {}, [rfInstance]);

    const getNetworksConfig = (): NetworkConfiguration => {
        const edges = getEdges();
        const intnets: Record<string, InternalNetwork> = {};
        const machinesWithInternetAccess: string[] = [];

        edges.forEach(({ source, target }) => {
            const machineUuid = getResourceUuidFromNode(source);

            if (!source.startsWith("machine") || _.isNull(machineUuid)) return;

            if (target.startsWith(CLOUD_ID)) return machinesWithInternetAccess.push(machineUuid);
            if (!target.startsWith("intnet")) return;

            const intnetUuid = getResourceUuidFromNode(target);
            if (_.isNull(intnetUuid)) return;

            if (!intnets[intnetUuid]) {
                intnets[intnetUuid] = {
                    uuid: intnetUuid,
                    machines: [],
                    display_name: "",
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
            machines?.forEach?.((machineUuid) => {
                addEdgeToFlow({
                    source: getNodeId("machine", machineUuid),
                    target: getNodeId("intnet", uuid),
                } as Edge);
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
            } as Edge);
        });
    };

    // Loads flow based on the provided positions and intnets data.
    const loadFlowWithIntnets = async (positions: Record<string, Position>, configuration: NetworkConfiguration) => {
        return new Promise<void>(async (resolve, reject) => {
            if (!positions || !configuration) return reject("Either positions or intnets is undefined.");

            const intnetsArray = _.values(configuration.internal_networks).filter((intnet) => intnet.machines.length > 1);
            const internetArray = configuration.machines_with_internet_access;

            positionsAllocator.setBounds(_.values(positions));

            setNodes([]);
            setEdges([]);

            createCloudNode(positions);
            createMachineNodes(positions);
            createFlowNodes("intnet", intnetsArray, positions);
            createIntnetEdges(intnetsArray);
            createInternetEdges(internetArray);

            const takenIntnetNumbers = intnetsArray.map((intnet) => getIntnetNumber(intnet.display_name)).filter((e) => !_.isNull(e));

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
                initCount.current += 1;
                notifications.hide(`network-panel.flow-init`);
                sendNotification("network-panel.flow-init", { color: "suse-green", uniqueId: false });
                setIsDirty(null);
            })
            .catch(() => sendErrorNotification(ERRORS.CVMM_650_INVALID_NETWORK_CONFIGURATION));
    }, [resetFlow]);

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

    const centerFlow = () => {
        if (!initCount.current) return;

        const center = calcMiddlePosition(...nodes.map((n) => n.position as Position));

        // adding half the node width
        if (center) setCenter(center.x + 50, center.y + 50);
        zoomTo(getZoom() - 0.5, { duration: 500 });
    };

    useEffect(initFlow, [machines]);

    useEffect(centerFlow, [initCount.current]);

    if (machinesError) {
        handleAxiosError(machinesError);
        return <></>;
    }

    return (
        <>
            <Prompt when={isDirty ?? false} />
            <Container
                flex="1"
                fluid
            >
                <ReactFlow
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
            </Container>
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
