import { IconX, IconCheck } from "@tabler/icons-react";
import { Text, Flex } from "@mantine/core";

const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
    return (
        <Flex
            c={meets ? "suse-green" : "cherry.4"}
            align="center"
            mt={7}
        >
            {meets ? (
                <IconCheck
                    size={14}
                    stroke={3}
                />
            ) : (
                <IconX
                    size={14}
                    stroke={3}
                />
            )}
            <Text
                fz="sm"
                ml={10}
            >
                {label}
            </Text>
        </Flex>
    );
};

export default PasswordRequirement;
