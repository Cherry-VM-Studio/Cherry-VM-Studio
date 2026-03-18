import { isNull } from "lodash";
import axios, { AxiosHeaders } from "axios";
import useApi from "./useApi";
import { notifications } from "@mantine/notifications";
import { formatBytesToUnitStringify, getRelevantUnit } from "../utils/files";
import { Text } from "@mantine/core";
import useNamespaceTranslation from "./useNamespaceTranslation";
import { useAuthentication } from "../contexts/AuthenticationContext";
import API_CONFIG from "../config/api.config";

const useContinousFileUpload = (path: string) => {
    const { authHeaders } = useAuthentication();
    const { getPath } = useApi();
    const { tns, t } = useNamespaceTranslation("notifications", "file");
    const uploadPath = getPath(path);

    const uploadFile = async (file: File | null, data: { [key: string]: any } = {}) => {
        if (isNull(file)) return;

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

            const startResponse = await axios.post(`${uploadPath}/start`, null, { headers: authHeaders, signal: controller.signal });

            const uuid = startResponse.data;

            for (let offset = 0; offset < file.size; offset += API_CONFIG.upload_chunk) {
                const slice = file.slice(offset, offset + API_CONFIG.upload_chunk);
                const formData = new FormData();
                formData.append("file", slice);

                await axios.post(`${uploadPath}/chunk`, formData, {
                    headers: {
                        ...authHeaders,
                        "Content-Type": "multipart/form-data",
                        "upload-uuid": uuid,
                        "bits-offset": offset,
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                    signal: controller.signal,
                    onUploadProgress: (e) => {
                        const loaded = Math.min(offset + e.loaded, file.size);
                        const uploadProgress = Math.round((loaded / file.size) * 100);

                        notifications.update({
                            id: notification,
                            message: getProgressMessageNode(
                                `${formatBytesToUnitStringify(loaded, relevantSizeUnit)} / ${fileSizeFormatted} (${uploadProgress}%)`,
                            ),
                            onClose: handleAbort,
                        });
                    },
                });
            }

            await axios.post(`${uploadPath}/complete`, { uuid, ...data }, { headers: authHeaders, signal: controller.signal });

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

export default useContinousFileUpload;
