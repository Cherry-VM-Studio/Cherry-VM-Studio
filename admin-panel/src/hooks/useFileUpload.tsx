import { isNull } from "lodash";
import axios, { AxiosHeaders } from "axios";
import useApi from "./useApi";
import { notifications } from "@mantine/notifications";
import { formatBytesToUnitStringify, getRelevantUnit } from "../utils/files";
import { Text } from "@mantine/core";
import useNamespaceTranslation from "./useNamespaceTranslation";
import { useAuthentication } from "../contexts/AuthenticationContext";

const useFileUpload = (path: string) => {
    const { authHeaders } = useAuthentication();
    const { getPath } = useApi();
    const fullPath = getPath(path);
    const { tns, t } = useNamespaceTranslation("notifications", "file");

    const uploadFile = async (file: File | null, data: { [key: string]: any } = {}) => {
        if (isNull(file)) return;

        const formData = new FormData();
        formData.append("data", JSON.stringify(data));
        formData.append("file", file);

        const headers = authHeaders;
        headers.set("Content-Type", "multipart/form-data");
        headers.set("filename", encodeURIComponent(file.name));

        const relevantSizeUnit = getRelevantUnit(file.size);
        const fileSizeFormatted = formatBytesToUnitStringify(file.size, relevantSizeUnit);

        const getProgressMessageNode = (progressString: string) => {
            return (
                <Text size="sm">
                    <Text
                        span
                        fw={500}
                    >{`${t("file")}: `}</Text>
                    {file.name}
                    <br />
                    <Text
                        span
                        fw={500}
                    >{`${t("progress")}: `}</Text>
                    {progressString}
                </Text>
            );
        };

        const notification = notifications.show({
            color: "yellow",
            title: tns("uploading.title"),
            message: getProgressMessageNode(`0${relevantSizeUnit} / ${fileSizeFormatted} (0%)`),
            autoClose: false,
            withCloseButton: true,
        });

        try {
            const controller = new AbortController();
            const handleAbort = () => controller.abort();

            await axios.post(fullPath, formData, {
                headers,
                signal: controller.signal,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                onUploadProgress: (progressEvent) => {
                    const uploadProgress = progressEvent.total ? Math.round((progressEvent.loaded / progressEvent.total) * 100) : 0;

                    notifications.update({
                        id: notification,
                        message: getProgressMessageNode(
                            `${formatBytesToUnitStringify(progressEvent.loaded, relevantSizeUnit)} / ${fileSizeFormatted} (${uploadProgress}%)`,
                        ),
                        onClose: handleAbort,
                    });
                },
            });

            notifications.update({
                id: notification,
                loading: false,
                color: "lime",
                title: tns("upload-success.title"),
                message: `${fileSizeFormatted} / ${fileSizeFormatted} (100%)`,
                autoClose: 3000,
            });
        } catch (err) {
            console.error(err);
            notifications.update({
                id: notification,
                loading: false,
                color: "red",
                title: tns("upload-error.title"),
                message: tns("upload-error.message", { name: file.name }),
                autoClose: false,
                withCloseButton: true,
            });
        }
    };

    return {
        uploadFile,
    };
};

export default useFileUpload;
