import React from "react";
import ConfirmationModal from "../../base/ConfirmationModal/ConfirmationModal";
import useApi from "../../../hooks/useApi";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import useMantineNotifications from "../../../hooks/useMantineNotifications";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { ERRORS_EXPANDED } from "../../../config/errors.config";
import { AxiosError } from "axios";

const DeleteAccountsModal = ({ opened, onClose, onSubmit = () => undefined, uuids }): React.JSX.Element => {
    const { sendRequest } = useApi();
    const { tns } = useNamespaceTranslation("modals", "confirm.account-removal");
    const { sendErrorNotification } = useMantineNotifications();
    const { handleAxiosError } = useErrorHandler();

    const onPostError = (error: AxiosError) => {
        if (error.response?.status !== 400) return handleAxiosError(error);

        const data = error.response?.data as Record<string, any>;
        const detail = data?.detail;

        if (detail.includes("permission unassigned")) {
            sendErrorNotification(ERRORS_EXPANDED.HTTP_400_CANNOT_REMOVE_USER);
            return;
        }
    };

    const onConfirm = () => {
        uuids.forEach((uuid: string) => sendRequest("DELETE", `users/delete/${uuid}`, undefined, onPostError));
        onClose();
        onSubmit();
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

export default DeleteAccountsModal;
