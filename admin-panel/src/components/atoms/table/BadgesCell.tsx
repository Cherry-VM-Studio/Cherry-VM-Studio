import { Badge, Group } from "@mantine/core";
import React from "react";
import { CellProps } from "../../../types/components.types";

const BadgesCell = ({getValue} : CellProps) : React.JSX.Element => {
    return (
        <Group>
            {(getValue() || []).map((role: string, i) =>
                <Badge 
                    key={i}
                    variant="light"
                    color='cherry' 
                    size='lg'
                    fw={500} 
                >
                    {role}
                </Badge>
            )}
        </Group>
    );
}

export default BadgesCell;