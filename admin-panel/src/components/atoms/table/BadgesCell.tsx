import { Badge, Group } from "@mantine/core";
import React from "react";
import { CellContext } from "@tanstack/react-table";

const BadgesCell = ({ getValue }: CellContext<unknown, string[]>): React.JSX.Element => {
    return (
        <Group>
            {(getValue() || []).map((role: string, i: number) => (
                <Badge
                    key={i}
                    variant="light"
                    color="cherry"
                    size="lg"
                    fw={500}
                >
                    {role}
                </Badge>
            ))}
        </Group>
    );
};

export default BadgesCell;
