import { Group, Progress, ProgressProps, Text } from "@mantine/core";
import React from "react";

const ProgressWithPercentage = ({ value, ...props }: ProgressProps): React.JSX.Element => {
    return (
        <Group flex="1">
            <Progress
                value={value}
                {...props}
            />
            <Text size="sm">{value || 0}%</Text>
        </Group>
    );
};

export default ProgressWithPercentage;
