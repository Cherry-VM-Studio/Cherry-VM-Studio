import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCameraPlus } from "@tabler/icons-react";
import AddSnapshotModal from "../../../../modals/networks/AddSnapshotModal/AddSnapshotModal";

export default function AddSnapshotButton({ postSnapshot, initiateSnapshotDataUpdate }) {
    const [opened, { open, close }] = useDisclosure();

    const onClick = () => open();

    return (
        <>
            <AddSnapshotModal
                opened={opened}
                close={close}
                postSnapshot={postSnapshot}
                initiateSnapshotDataUpdate={initiateSnapshotDataUpdate}
            />
            <Button
                onClick={onClick}
                variant='default'
                size='sm'
                pl='xs'
                pr='9'
            >
                <IconCameraPlus size={20} />
            </Button>
        </>
    )
}

