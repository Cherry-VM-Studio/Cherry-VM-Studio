import { Group, Stack, Text } from "@mantine/core";
import { MachineDiskDynamicData } from "../../../types/api.types";
import { IconStorageDrive } from "../icons/IconStorageDrive/IconStorageDrive";
import { formatBytesToRelevantUnit, formatBytesToUnit, formatBytesToUnitStringify, getRelevantUnit } from "../../../utils/files";

export interface MachineDisksCellProps {
    getValue: () => MachineDiskDynamicData[];
}

const MachineDisksCell = ({ getValue }: MachineDisksCellProps): React.JSX.Element => {
    const disks = getValue();
    return (
        <Group wrap="nowrap">
            {disks.map((disk, i) => {
                const relevantUnit = getRelevantUnit(disk.size_bytes);
                return (
                    <Stack
                        gap="xs"
                        key={i}
                        align="center"
                    >
                        <IconStorageDrive
                            width="22"
                            height="22"
                        />
                        <Text size="sm">{`${formatBytesToUnit(disk?.occupied_bytes, relevantUnit, 1)}/${formatBytesToUnitStringify(disk.size_bytes, relevantUnit, 1)}`}</Text>
                    </Stack>
                );
            })}
        </Group>
    );
};

export default MachineDisksCell;
