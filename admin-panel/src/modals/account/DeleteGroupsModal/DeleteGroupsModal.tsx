import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";

export interface DeleteGroupsModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    uuids: string[];
}

const DeleteGroupsModal = ({ opened, onClose, onSubmit, uuids }: DeleteGroupsModalProps): React.JSX.Element => {
    const { sendRequest } = useApi();
    const { tns } = useNamespaceTranslation("modals", "confirm.group-removal");

    const onConfirm = () => {
        uuids.forEach((uuid: string) => sendRequest("DELETE", `groups/delete/${uuid}`));
        onClose();
        onSubmit?.();
    };

    return (
        <ConfirmationModal
            opened={opened}
            onClose={onClose}
            onConfirm={onConfirm}
            title={tns("title")}
            message={tns("description", { count: uuids.length })}
            confirmButtonProps={{ color: "cherry.6" }}
        />
    );
};

export default DeleteGroupsModal;
