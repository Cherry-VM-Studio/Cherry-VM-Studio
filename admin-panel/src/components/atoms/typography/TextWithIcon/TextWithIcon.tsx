import { Group, Text, TextProps } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import React from "react";

export interface TextWithIconProps extends TextProps {
    Icon: TablerIcon;
    text: string;
}

const TextWithIcon = ({ Icon, text, ...props }: TextWithIconProps): React.JSX.Element => (
    <Group
        justify="start"
        align="center"
        gap="4"
    >
        <Icon size={18} />
        <Text {...props}>{text}</Text>
    </Group>
);

export default TextWithIcon;
