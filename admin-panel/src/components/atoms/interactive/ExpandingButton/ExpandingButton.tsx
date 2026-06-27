import { Button } from "@mantine/core";
import { motion } from "framer-motion";
import { ExpandingButtonProps } from "../../../../types/components.types";

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
        transition={{ duration: duration, ease: ease }}
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
