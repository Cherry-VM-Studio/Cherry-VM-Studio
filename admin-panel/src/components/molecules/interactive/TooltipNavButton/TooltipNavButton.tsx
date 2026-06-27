import { Tooltip } from "@mantine/core";
import React from "react";
import NavButton, { NavButtonProps } from "../../../atoms/interactive/NavButton/NavButton";

const TooltipNavButton = ({ label, icon, active, ...props }: Partial<NavButtonProps>) => (
    <Tooltip
        label={label}
        hidden={!label}
        position="right"
        color="#3b3b3b"
        offset={{
            mainAxis: 8,
        }}
        transitionProps={{
            transition: "scale-x",
            duration: 200,
        }}
    >
        <NavButton
            icon={icon}
            label={label}
            active={active}
            {...props}
        />
    </Tooltip>
);

export default TooltipNavButton;
