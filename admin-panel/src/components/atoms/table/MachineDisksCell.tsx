import { Group, ScrollArea, Stack, Text } from "@mantine/core";
import { MachineDiskDynamicData } from "../../../types/api.types";
import { IconStorageDrive } from "../icons/IconStorageDrive/IconStorageDrive";
import { formatBytesToUnit, formatBytesToUnitStringify, getRelevantUnit } from "../../../utils/files";

export interface MachineDisksCellProps {
    getValue: () => MachineDiskDynamicData[];
}

const MachineDisksCell = ({ getValue }: MachineDisksCellProps): React.JSX.Element => {
    const disks = getValue();
    return (
        <ScrollArea
            scrollbars="x"
            offsetScrollbars
            scrollbarSize="0.525rem"
            type="auto"
        >
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
                            <Text
                                size="sm"
                                style={{ textWrap: "nowrap" }}
                            >{`${formatBytesToUnit(disk?.occupied_bytes, relevantUnit, 1)}/${formatBytesToUnitStringify(disk.size_bytes, relevantUnit, 1)}`}</Text>
                        </Stack>
                    );
                })}
            </Group>
        </ScrollArea>
    );
};

export default MachineDisksCell;
