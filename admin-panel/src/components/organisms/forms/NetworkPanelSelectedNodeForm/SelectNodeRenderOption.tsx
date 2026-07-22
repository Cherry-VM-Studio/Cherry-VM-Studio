import { ComboboxItem, ComboboxLikeRenderOptionInput, Group, Stack, Text } from "@mantine/core";
import { IconCloud, IconDeviceDesktop, IconPlus, IconTopologyStar3 } from "@tabler/icons-react";
import { getResourceTypeFromNode, getResourceUuidFromNode } from "../../../../pages/administrative/networks/NetworkPanelPage/reactFlow";

const SelectNodeRenderOption = ({ option, checked }: ComboboxLikeRenderOptionInput<ComboboxItem>): React.JSX.Element => {
    return (
        <Group gap="xs">
            {
                {
                    cloud: <IconCloud size={26} />,
                    intnet: <IconTopologyStar3 size={26} />,
                    machine: <IconDeviceDesktop size={26} />,
                    "add-intnet": <IconPlus size={26} />,
                }[getResourceTypeFromNode(option.value) ?? ""]
            }
            <Stack gap="0">
                <Text fz="sm">{option.label}</Text>
                <Text
                    fz="xs"
                    c="dimmed"
                >
                    {getResourceUuidFromNode(option.value)}
                </Text>
            </Stack>
        </Group>
    );
};

export default SelectNodeRenderOption;
