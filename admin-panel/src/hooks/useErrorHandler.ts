import useMantineNotifications from "./useMantineNotifications";
import { AxiosError } from "axios";
import { ERROR_VARIANTS_MAP, ErrorCode, ExpandedErrorCode } from "../config/errors.config";

export interface ErrorHandlerReturn {
    handleError: (error: ErrorCode | ExpandedErrorCode) => Promise<void>;
    handleAxiosError: (error: AxiosError) => Promise<AxiosError>;
}

const useErrorHandler = (): ErrorHandlerReturn => {
    const { sendErrorNotification } = useMantineNotifications();

    const handleError = async (error: ErrorCode | ExpandedErrorCode) => {
        sendErrorNotification(error);
    };

    const handleAxiosError = async (error: AxiosError) => {
        const code = error.response?.status || 600;
        const data = error.response?.data as Record<string, any>;
        const detail = data?.detail;
        const variant = ERROR_VARIANTS_MAP[code]?.[detail];

        sendErrorNotification([code, variant] as ErrorCode | ExpandedErrorCode);
        return error;
    };

    return { handleError, handleAxiosError };
};

export default useErrorHandler;
