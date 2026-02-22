import { Indicator, IndicatorProps } from "@mantine/core";
import {
    IconDeviceDesktop,
    IconDeviceDesktopDown,
    IconDeviceDesktopOff,
    IconDeviceDesktopQuestion,
    IconDeviceDesktopUp,
    TablerIcon,
} from "@tabler/icons-react";
import { MachineState } from "../../../../types/api.types";

export interface MachineActivityIndicatorProps extends IndicatorProps {
    state: MachineState;
    iconProps?: any;
}

const MachineActivityIndicator = ({ state, iconProps, ...props }: MachineActivityIndicatorProps): React.JSX.Element => {
    const componentMap: Record<MachineState, TablerIcon> = {
        FETCHING: IconDeviceDesktopQuestion,
        LOADING: IconDeviceDesktop,
        BOOTING_UP: IconDeviceDesktopUp,
        SHUTTING_DOWN: IconDeviceDesktopDown,
        ACTIVE: IconDeviceDesktop,
        ERROR: IconDeviceDesktopOff,
        OFFLINE: IconDeviceDesktopOff,
    };

    const colorMap: Record<MachineState, string> = {
        FETCHING: "orange.6",
        LOADING: "yellow.5",
        BOOTING_UP: "yellow.5",
        SHUTTING_DOWN: "yellow.5",
        ACTIVE: "suse-green.5",
        OFFLINE: "cherry.5",
        ERROR: "cherry.11",
    };

    const color = colorMap[state || "FETCHING"];
    const IconComponent = componentMap[state || "FETCHING"];

    return (
        <Indicator
            position="bottom-end"
            color={color}
            withBorder={false}
            size="8"
            zIndex={3}
            {...props}
        >
            <IconComponent
                size={28}
                {...iconProps}
            />
        </Indicator>
    );
};

export default MachineActivityIndicator;
