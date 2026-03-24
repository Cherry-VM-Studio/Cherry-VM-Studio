import { Container } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    Background,
    ConnectionMode,
    Controls,
    MiniMap,
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
import { safeObjectValues } from "../../../../utils/misc.js";
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
import { Intnet, IntnetNodeObject, Intnets, NodeDataMap, Position } from "./reactFlow.types.ts";
import _ from "lodash";
import MachineNode from "../../../../components/atoms/flow-nodes/MachineNode/MachineNode.tsx";
import IntnetNode from "../../../../components/atoms/flow-nodes/IntnetNode/IntnetNode.tsx";
import { isAxiosError } from "axios";
import { useProfile } from "../../../../contexts/ProfileContext.tsx";
import CloudNode from "../../../../components/atoms/flow-nodes/CloudNode/CloudNode.tsx";
import { NetworkConfiguration } from "../../../../types/api.types.ts";

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

    const [selectedAccountUuid, setSelectedAccountUuid] = useState(getProfile()?.uuid || null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance>(null);

    const initCount = useRef(0);
    const intnetAllocator = useRef(new NumberAllocator()).current;
    const newPositionsAllocator = useRef(new NumberAllocator()).current;

    const generateNewPos = () => ({ x: newPositionsAllocator.getNext() * 200, y: 0 });

    /**
     * [isDirty]
     * true - unsaved changes
     * false - no unsaved changes
     * null - no unsaved changes and just loaded
     */
    const [isDirty, setIsDirty] = useState(null);

    const paths = {
        machines: `/machines/account/${selectedAccountUuid ?? ""}`,
        getWorkspace: `/network/workspace/${selectedAccountUuid ?? ""}`,
        putPositions: `/network/configuration/positions/${selectedAccountUuid ?? ""}`,
        putConfiguration: `/network/configuration/networks/${selectedAccountUuid ?? ""}`,
    };

    const { error: machinesError, data: machines, refresh: refreshMachines } = useFetch(paths.machines);

    // adds new nodes to the flow
    const addNodes = (...nodes) => setNodes((nds) => [...nds, ...nodes.flat()]);

    // adds an edge between nodes in the flow
    const addEdgeToFlow = (edge) => {
        setEdges((eds) => addEdge(edge, eds));
        setIsDirty(true);
    };

    /**
     * Handles changes to nodes in the flow.
     * Marks the flow as unsaved (dirty) if changes are made.
     */
    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
        if (changes && !changes.every((e) => e.type === "dimensions")) setIsDirty(true);
    }, []);

    /**
     * Handles the deletion of nodes from the flow.
     * When deleting an intnet node, removes the intnet number from the allocator,
     * allowing for future intnets to use its number.
     */
    const onNodesDelete = useCallback((deletedNodes) => deletedNodes.forEach((node) => intnetAllocator.remove(node?.number)), []);

    /**
     * Handles changes to edges in the flow.
     * Marks the flow as unsaved (dirty).
     */
    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
        setIsDirty(true);
    }, []);

    /**
     * Handles connection events between nodes.
     * When connecting a machine to another machine, it automatically creates a new internal network between them.
     */
    const onNodesConnect = useCallback(
        ({ source, target }) => {
            if (source.startsWith("intnet") || source.startsWith("cloud")) return;
            if (target.startsWith("intnet") || target.startsWith("cloud")) return addEdgeToFlow({ source: source, target: target });

            const intnet = { uuid: uuidv4(), number: intnetAllocator.getNext() } as Intnet;
            const intnetPosition = calcMiddlePosition(getNode(source).position, getNode(target).position);
            const intnetNode = generateIntnetNodeObject(intnet, intnetPosition);

            addNodes(intnetNode);
            addEdgeToFlow({ source: target, target: intnetNode.id });
            addEdgeToFlow({ source: source, target: intnetNode.id });
        },
        [setEdges],
    );

    const getNodePositions = useCallback(() => rfInstance.getNodes().reduce((acc, node) => ({ ...acc, [node.id]: node.position }), {}), [rfInstance]);

    const getNetworksConfig = (): NetworkConfiguration => {
        const edges = getEdges();
        const intnets = {};
        const machinesWithInternetAccess = [];

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
                    number: (getNode(intnetUuid) as IntnetNodeObject).number,
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

        const getPos = (uuid: string) => positions[getNodeId(nodeType, uuid)] ?? generateNewPos();

        addNodes(data.map((node) => generateNodeObject(nodeType, node, getPos(node.uuid))));
    };

    const createCloudNode = (positions: Record<string, Position>) => {
        const pos = positions["cloud:::"] ?? { x: 150, y: -250 };
        addNodes(generateCloudNodeObject(pos));
    };

    // Creates nodes representing virtual machines.
    const createMachineNodes = (positions: Record<string, Position>) => createFlowNodes("machine", safeObjectValues(machines), positions);

    // Creates edges between machine nodes and intnet nodes based on the intnet configuration.
    const createIntnetEdges = (intnets: Intnet[]) => {
        if (_.isEmpty(intnets)) return;

        intnets.forEach(({ uuid, machines }) =>
            machines?.forEach?.((machineUuid) => {
                addEdgeToFlow({
                    source: getNodeId("machine", machineUuid),
                    target: getNodeId("intnet", uuid),
                });
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
            });
        });
    };

    // Loads flow based on the provided positions and intnets data.
    const loadFlowWithIntnets = async (positions: Record<string, Position>, configuration: NetworkConfiguration) => {
        return new Promise<void>(async (resolve, reject) => {
            if (!positions || !configuration) return reject("Either positions or intnets is undefined.");

            const intnetsArray = _.values(configuration.internal_networks).filter((intnet) => intnet.machines.length > 1);
            const internetArray = configuration.machines_with_internet_access;

            setNodes([]);
            setEdges([]);

            createCloudNode(positions);
            createMachineNodes(positions);
            createFlowNodes("intnet", intnetsArray, positions);
            createIntnetEdges(intnetsArray);
            createInternetEdges(internetArray);
            intnetAllocator.setCurrent(Math.max(...intnetsArray.map((e) => e.number), 0));
            newPositionsAllocator.setCurrent(0);
            resolve();
        });
    };

    // Resets the flow to the current network configuration from the backend.
    const resetFlow = async () => {
        const { configuration, positions } = await sendRequest("GET", paths.getWorkspace);
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
    const putNodePositions = () => sendRequest("PUT", paths.putPositions, { data: getNodePositions() });

    // Sends a PUT request to save the internal network (Intnet) configuration.
    const putIntnetConfiguration = () => sendRequest("PUT", paths.putConfiguration, { data: getNetworksConfig() });

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
        return;
    }

    return (
        <>
            <Prompt when={isDirty} />
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

export default function NetworkPanelPage(props) {
    return (
        <ReactFlowProvider>
            <Flow {...props} />
        </ReactFlowProvider>
    );
}
