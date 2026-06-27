import { Button } from "@mantine/core";
import React, { forwardRef } from "react";
import classes from "./MediumPanelButton.module.css";
import { MediumPanelButonProps } from "../../../../types/components.types";

const MediumPanelButton = forwardRef<HTMLButtonElement, MediumPanelButonProps>(({ Icon, label, onClick, ...props }: MediumPanelButonProps, ref): React.JSX.Element => (
    <Button
        {...props}
        ref={ref}
        className={classes.button}
        size='md'
        leftSection={<Icon size='24' />}
        onClick={onClick}
    >
        {label}
    </Button>
));

export default MediumPanelButton;