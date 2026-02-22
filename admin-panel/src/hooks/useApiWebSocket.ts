import { useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import urlConfig from "../config/url.config.ts";
import { useAuthentication } from "../contexts/AuthenticationContext.tsx";
import { validPath } from "../utils/path.ts";
import useApi from "./useApi.ts";
import { isUndefined, omitBy } from "lodash";

export interface useApiWebSocketReturn {
    lastJsonMessage: any | null;
    connectionStatus: string;
    error: WebSocketEventMap["error"] | null;
}

const useApiWebSocket = (path: string, params: Record<string, string> = {}): useApiWebSocketReturn => {
    const { tokens } = useAuthentication();
    const { refreshTokens } = useApi();

    const [error, setError] = useState<WebSocketEventMap["error"] | null>(null);
    const lastReconnectRef = useRef<number | null>(null);

    const API_WEBSOCKET_URL: string = urlConfig.api_websockets;

    const buildQuery = (params: Record<string, string>) => {
        const searchParams = new URLSearchParams(omitBy(params, isUndefined));
        searchParams.set("access_token", tokens.access_token);
        return searchParams.toString();
    };

    const getUrl = (path: string, params: Record<string, string> = {}) => `${API_WEBSOCKET_URL}${validPath(path)}?${buildQuery(params)}`;

    const onError = (event: WebSocketEventMap["error"]) => {
        // @ts-ignore
        if (event.code === 4401) return;

        setError(event);
    };

    const shouldReconnect = (event: WebSocketEventMap["error"]) => {
        const now = Date.now();

        // @ts-ignore
        if (event.code !== 4401) return false;
        if (lastReconnectRef.current && now - lastReconnectRef.current < 30_000) return false;

        lastReconnectRef.current = now;
        refreshTokens();
        return true;
    };

    const { lastJsonMessage, readyState } = useWebSocket(getUrl(path, params), { onError, shouldReconnect });

    const connectionStatus: string = {
        [ReadyState.CONNECTING]: "CONNECTING",
        [ReadyState.OPEN]: "OPEN",
        [ReadyState.CLOSING]: "CLOSING",
        [ReadyState.CLOSED]: "CLOSED",
        [ReadyState.UNINSTANTIATED]: "UNINSTANTIATED",
    }[readyState];

    return {
        lastJsonMessage,
        connectionStatus,
        error,
    };
};

export default useApiWebSocket;
