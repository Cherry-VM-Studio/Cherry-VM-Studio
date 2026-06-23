import { Button } from "@mantine/core";
import React from "react";

export interface ConnectButtonProps {
    active: boolean;
    label: string;
    onClick: React.MouseEventHandler;
}

const ConnectButton = ({ onClick, active, label }: ConnectButtonProps): React.JSX.Element => {
    return (
        <Button
            onClick={onClick}
            disabled={!active}
            color="dark.1"
            variant="light"
            mt="md"
            radius="md"
        >
            {label}
        </Button>
    );
};

export default ConnectButton;
