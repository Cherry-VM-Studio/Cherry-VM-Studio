import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { combinePaths } from "../../../utils/path";

export interface DeleteModalProps {
    uuids: string[];
    path: string;
    i18nextPrefix: string;
    opened: boolean;
    onClose: () => void;
    onSubmit: (uuids: string[]) => void;
}

const DeleteModal = ({ opened, onClose, onSubmit = () => undefined, uuids, i18nextPrefix, path }: DeleteModalProps): React.JSX.Element => {
    const { sendRequest } = useApi();
    const { tns } = useNamespaceTranslation("modals", i18nextPrefix);

    const onConfirm = async () => {
        await Promise.all(uuids.map((uuid: string) => sendRequest("DELETE", combinePaths(path, uuid))));
        onClose();
        onSubmit(uuids);
    };

    return (
        <ConfirmationModal
            opened={opened}
            onClose={onClose}
            onConfirm={onConfirm}
            title={tns("title")}
            message={tns("description", {
                count: uuids.length,
            })}
            confirmButtonProps={{
                color: "cherry.6",
            }}
        />
    );
};

export default DeleteModal;
