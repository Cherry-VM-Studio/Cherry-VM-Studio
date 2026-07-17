import { BaseEdge, Edge, EdgeLabelRenderer, getStraightPath, useInternalNode, useReactFlow } from "@xyflow/react";
import { getEdgeParams } from "../utils.js";
import { IconX } from "@tabler/icons-react";
import classes from "../Floating.module.css";
import { Group, Stack, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { NetworkPanelEdge } from "../../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types.js";

function FloatingEdge({ id, source, target, markerEnd, style, data }: NetworkPanelEdge) {
    const { t } = useTranslation();
    const { setEdges } = useReactFlow();
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    const removeEdge = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <BaseEdge
                id={id}
                className={classes.edgePath}
                path={edgePath}
                markerEnd={typeof markerEnd === "string" ? markerEnd : undefined}
                style={style}
            />
            <EdgeLabelRenderer>
                <Tooltip
                    label={
                        <Stack
                            gap="xs"
                            pt="6"
                            pb="6"
                        >
                            <Stack gap="0">
                                <Text
                                    fz="xs"
                                    fw="600"
                                >
                                    {t("mac-address")}
                                </Text>
                                <Text
                                    fz="xs"
                                    c="dark.8"
                                >
                                    {data?.interfaceMac?.toUpperCase() ?? t("unknown")}
                                </Text>
                            </Stack>
                            <Stack gap="0">
                                <Text
                                    fz="xs"
                                    fw="600"
                                >
                                    {t("ip-address")}
                                </Text>
                                <Text
                                    fz="xs"
                                    c="dark.8"
                                >
                                    {data?.interfaceIp ?? t("unknown")}
                                </Text>
                            </Stack>
                        </Stack>
                    }
                    withArrow
                >
                    <div
                        className={classes.edgeDot}
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${sx}px, ${sy}px)`,
                            pointerEvents: "all",
                            zIndex: 2000,
                        }}
                    />
                </Tooltip>

                <div
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: "all",
                    }}
                >
                    <button
                        className={classes.deleteButton}
                        onClick={removeEdge}
                    >
                        <IconX size={10} />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export default FloatingEdge;
