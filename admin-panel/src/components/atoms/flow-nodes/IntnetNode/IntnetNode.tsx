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
            <Text
                ta="center"
                style={{ fontSize: "18px" }}
            >
                {data.label}
            </Text>
        </Stack>
    );
};

export default IntnetNode;
