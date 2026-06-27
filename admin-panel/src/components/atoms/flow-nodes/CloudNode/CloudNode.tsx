import { Stack, Text } from "@mantine/core";
import { IconCloud } from "@tabler/icons-react";
import { Handle, Position } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import classes from "./CloudNode.module.css";

const CloudNode = (): React.JSX.Element => {
    const { t } = useTranslation();
    return (
        <Stack
            align="center"
            p="2"
            gap="0"
            w={200}
        >
            <Handle
                className={classes.customHandle}
                position={Position.Left}
                type="target"
                isConnectableStart={false}
            />
            <IconCloud
                size="156"
                stroke={1}
            />
            <Text mt="-20">{t("internet-gateway")}</Text>
        </Stack>
    );
};

export default CloudNode;
