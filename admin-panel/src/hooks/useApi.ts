import useErrorHandler from "./useErrorHandler.ts";
import urlConfig from "../config/url.config.ts";
import { useAuthentication } from "../contexts/AuthenticationContext.tsx";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { merge, toString } from "lodash";
import { ERRORS } from "../config/errors.config.ts";
import { Tokens } from "../types/api.types.ts";
import { validPath } from "../utils/path.ts";

type RequestMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface useApiReturn {
    getPath: (path: string) => string;
    refreshTokens: () => Promise<Tokens>;
    sendRequest: <T = any>(method: RequestMethods, path: string, config?: AxiosRequestConfig, errorCallback?: (error: AxiosError) => void) => Promise<T>;
}

export const useApi = (): useApiReturn => {
    const API_URL: string = urlConfig.api_requests;
    const { handleAxiosError } = useErrorHandler();
    const { authHeaders, refreshHeaders, setAccessToken, setRefreshToken, logout } = useAuthentication();

    const baseApiRequestConfig = {
        headers: authHeaders,
        transitional: { clarifyTimeoutError: true },
        timeout: 10000,
        timeoutErrorMessage: "No response from the API service.",
    } as AxiosRequestConfig;

    const getPath = (path: string): string => (API_URL ? `${API_URL}${validPath(path)}` : undefined);

    const refreshTokens = async (): Promise<Tokens> => {
        return await axios
            .get(getPath("/refresh"), {
                headers: refreshHeaders,
            })
            .then((response) => {
                setAccessToken(response.data?.access_token);
                setRefreshToken(response.data?.refresh_token);
                return response.data;
            })
            .catch((error: AxiosError) => {
                if (error.response) {
                    if (error.response.status === 401) return logout();
                    console.error(error.response);
                } else console.error("Error occured during refreshing the tokens.", error);
            });
    };

    const sendRequest = async <T = any>(
        method: RequestMethods,
        path: string,
        config: AxiosRequestConfig = {},
        errorCallback: ((error: AxiosError) => void) | null = handleAxiosError,
    ): Promise<T> => {
        const mergedConfig = merge(baseApiRequestConfig, config);

        const sendFetch = async (): Promise<AxiosResponse> => await axios({ ...mergedConfig, method, url: getPath(path) });

        return await sendFetch()
            .then((response) => response.data)
            .catch(async (error: AxiosError) => {
                if (error.code !== "ETIMEDOUT" && error.code !== "ERR_NETWORK")
                    if (error.response) {
                        if (error.response.status !== ERRORS.HTTP_401_UNAUTHORIZED) return errorCallback?.(error);

                        // handle expired access token - try to refresh tokens
                        const tokens = await refreshTokens();
                        if (!tokens?.access_token) return errorCallback?.(error);

                        // after succesfull refresh send the original request again for seamless UX
                        mergedConfig.headers["Authorization"] = `Bearer ${tokens.access_token}`;
                        return await sendFetch()
                            .then((response) => response.data)
                            .catch(errorCallback);
                    }
                if (error.request) return errorCallback?.(error);

                console.error("Unhandled error occured during fetch.", error);
            });
    };

    return { getPath, refreshTokens, sendRequest };
};

export default useApi;
