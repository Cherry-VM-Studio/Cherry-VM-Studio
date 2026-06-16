import { ActionIcon } from "@mantine/core";
import React, { ReactNode } from "react";
import classes from "./NavButton.module.css";

export interface NavButtonProps {
    label: ReactNode;
    active?: boolean;
    icon: React.ReactElement;
    [key: string]: any;
}

export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(({ icon, label, active = false, disabled, ...props }: NavButtonProps, ref) => {
    return (
        <div style={{ cursor: disabled ? "not-allowed" : active ? "default" : "pointer" }}>
            <ActionIcon
                {...props}
                ref={ref}
                variant="filled"
                className={classes.actionIcon}
                disabled={active || disabled}
                size="xl"
                aria-selected={active}
            >
                {icon}
            </ActionIcon>
        </div>
    );
});

export default NavButton;
