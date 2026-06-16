import { Box, Group, NumberInput, Slider, SliderProps, Stack, Text } from "@mantine/core";
import classes from "./EnhancedSlider.module.css";
import cs from "classnames";
import { ReactNode } from "react";

export interface EnhancedSliderProps extends SliderProps {
    heading?: ReactNode;
    label: (value: number) => ReactNode;
}

const EnhancedSlider = ({ label, disabled, heading, value, onChange, min, max, children, className, ...props }: EnhancedSliderProps): React.JSX.Element => {
    return (
        <Stack
            gap="0"
            className={cs(classes.container, className)}
        >
            {heading && (
                <Text
                    fw="500"
                    size="sm"
                >
                    {heading}
                </Text>
            )}
            <Group
                align="center"
                gap="sm"
            >
                <Box flex="1">
                    <Slider
                        max={max}
                        min={min}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        {...props}
                    />
                </Box>
                <Box>
                    <Group gap="2">
                        <NumberInput
                            variant="unstyled"
                            value={value}
                            rightSection={` / ${max} ${label(max)}`}
                            w="150px"
                            rightSectionWidth={"60%"}
                            styles={{
                                input: {
                                    textAlign: "right",
                                },
                                section: {
                                    paddingLeft: "8px",
                                    justifyContent: "start",
                                    fontSize: "var(--mantine-font-size-sm)",
                                },
                            }}
                            classNames={{
                                input: "borderless",
                            }}
                            max={max}
                            min={min}
                            clampBehavior="strict"
                            onChange={onChange}
                            readOnly={disabled}
                        />
                    </Group>
                </Box>
            </Group>
        </Stack>
    );
};

export default EnhancedSlider;
