import { Center, Group, rem, Space, Stack, Text } from "@mantine/core";
import React from "react";

const DobrePage = (): React.JSX.Element => {
    return (
        <Center
            h="100vh"
            w="100%"
        >
            <Stack>
                <Group
                    align="flex-end"
                    gap="xl"
                >
                    <Text
                        fw={500}
                        size={rem(64)}
                        c="#ffc83d"
                        style={{
                            textShadow:
                                "rgb(0, 0, 0) 6px 0px 0px, rgb(0, 0, 0) 5.91686px 0.995377px 0px, rgb(0, 0, 0) 5.66974px 1.96317px 0px, rgb(0, 0, 0) 5.2655px 2.87655px 0px, rgb(0, 0, 0) 4.71532px 3.71022px 0px, rgb(0, 0, 0) 4.03447px 4.44106px 0px, rgb(0, 0, 0) 3.24181px 5.04883px 0px, rgb(0, 0, 0) 2.35931px 5.51667px 0px, rgb(0, 0, 0) 1.41143px 5.83163px 0px, rgb(0, 0, 0) 0.424423px 5.98497px 0px, rgb(0, 0, 0) -0.574341px 5.97245px 0px, rgb(0, 0, 0) -1.55719px 5.79441px 0px, rgb(0, 0, 0) -2.49688px 5.45578px 0px, rgb(0, 0, 0) -3.36738px 4.96596px 0px, rgb(0, 0, 0) -4.14455px 4.33852px 0px, rgb(0, 0, 0) -4.80686px 3.59083px 0px, rgb(0, 0, 0) -5.33596px 2.74364px 0px, rgb(0, 0, 0) -5.71718px 1.8204px 0px, rgb(0, 0, 0) -5.93996px 0.84672px 0px, rgb(0, 0, 0) -5.99811px -0.150428px 0px, rgb(0, 0, 0) -5.89004px -1.14341px 0px, rgb(0, 0, 0) -5.61874px -2.1047px 0px, rgb(0, 0, 0) -5.19172px -3.00766px 0px, rgb(0, 0, 0) -4.62082px -3.82727px 0px, rgb(0, 0, 0) -3.92186px -4.54081px 0px, rgb(0, 0, 0) -3.11421px -5.12852px 0px, rgb(0, 0, 0) -2.22026px -5.57409px 0px, rgb(0, 0, 0) -1.26477px -5.86518px 0px, rgb(0, 0, 0) -0.274238px -5.99373px 0px, rgb(0, 0, 0) 0.723898px -5.95617px 0px, rgb(0, 0, 0) 1.70197px -5.75355px 0px, rgb(0, 0, 0) 2.63288px -5.39147px 0px, rgb(0, 0, 0) 3.49082px -4.87998px 0px, rgb(0, 0, 0) 4.25202px -4.23324px 0px, rgb(0, 0, 0) 4.89538px -3.46919px 0px, rgb(0, 0, 0) 5.40307px -2.60899px 0px, rgb(0, 0, 0) 5.76102px -1.67649px 0px, rgb(0, 0, 0) 5.95932px -0.697531px 0px",
                        }}
                    >
                        dobre
                    </Text>
                    <Text size={rem(72)}>🐧👍</Text>
                </Group>
                <Space h="xl" />
            </Stack>
        </Center>
    );
};

export default DobrePage;
