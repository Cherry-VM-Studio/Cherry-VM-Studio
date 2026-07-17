import { Handle, Position } from "@xyflow/react";
import { Stack, Text } from "@mantine/core";
import classes from "./IntnetNode.module.css";
import { IntnetNodeData } from "../../../../pages/administrative/networks/NetworkPanelPage/reactFlow.types";

export interface IntnetNodeProps {
    data: IntnetNodeData;
}

const IntnetNode = ({ data }: IntnetNodeProps): React.JSX.Element => {
    return (
        <Stack className={classes.intnetNode}>
            <Handle
                className={classes.customHandle}
                position={Position.Left}
                type="target"
                isConnectableStart={false}
            />
            <Stack gap="0">
                <Text
                    ta="center"
                    fz="18"
                >
                    {data.label}
                </Text>
                <Text
                    ta="center"
                    fz="10"
                    c="dimmed"
                >
                    {data.mac}
                </Text>
                <Text
                    ta="center"
                    fz="10"
                    c="dimmed"
                >
                    {data.bridgeIp}
                </Text>
            </Stack>
        </Stack>
    );
};

export default IntnetNode;
