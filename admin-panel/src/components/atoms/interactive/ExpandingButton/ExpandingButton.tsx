import { Button, ButtonProps } from "@mantine/core";
import { motion } from "framer-motion";
import { ComponentType } from "react";

export interface ExpandingButtonProps extends ButtonProps {
    ButtonComponent?: ComponentType<any>;
    parentGap: string; // the gap property in the parent flex container
    mounted: boolean;
    children: any;
    ease: string;
    duration: number;
    w: number;
}

const ExpandingButton = ({
    ButtonComponent = Button,
    w,
    parentGap = "0",
    mounted,
    children,
    ease = "easeInOut",
    duration = 0.2,
    ...props
}: ExpandingButtonProps): React.JSX.Element => (
    <motion.div
        initial={{
            width: 0,
            opacity: 0,
            marginRight: `-${parentGap}`,
        }}
        animate={{
            width: mounted ? w : 0,
            opacity: ~~mounted,
            marginRight: mounted ? "0" : `-${parentGap}`,
        }}
        transition={{ duration: duration, ease: "easeInOut" }}
        style={{
            overflow: "hidden",
            display: "flex",
        }}
        autoFocus={mounted}
    >
        <ButtonComponent
            w="100%"
            autoFocus={mounted}
            {...props}
        >
            {children}
        </ButtonComponent>
    </motion.div>
);

export default ExpandingButton;
