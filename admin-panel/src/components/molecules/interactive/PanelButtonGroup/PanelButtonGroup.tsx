import { Button, Divider } from "@mantine/core";
import React from "react";

const PanelButtonGroup = ({ children }: { children: React.ReactNode[] }): React.JSX.Element => {
    return (
        <Button.Group>
            {children.map((child, i) => (
                <React.Fragment key={i}>
                    {child}
                    {i === children.length - 1 || <Divider size="lg" orientation="vertical" />}
                </React.Fragment>
            ))}
        </Button.Group>
    );
};

export default PanelButtonGroup;