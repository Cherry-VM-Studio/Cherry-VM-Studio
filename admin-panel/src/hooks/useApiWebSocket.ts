import { useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import urlConfig from "../config/url.config.ts";
import { useAuthentication } from "../contexts/AuthenticationContext.tsx";
import { validPath } from "../utils/path.ts";
import useApi from "./useApi.ts";

export interface useApiWebSocketReturn {
    setUrl: (path: string, params?: Record<string, string>) => void;
    lastJsonMessage: any | null;
    connectionStatus: string;
}

const useApiWebSocket = (path: string, params: Record<string, string> = {}): useApiWebSocketReturn => {
    const { tokens } = useAuthentication();
    const { refreshTokens } = useApi();
    const lastReconnectRef = useRef<number | null>(null);

    const API_WEBSOCKET_URL: string = urlConfig.api_websockets;

    const buildQuery = (params: Record<string, string>) => {
        const searchParams = new URLSearchParams(params);
        searchParams.set("access_token", tokens.access_token);
        return searchParams.toString();
    };

    const getUrl = (path: string, params: Record<string, string> = {}) => `${API_WEBSOCKET_URL}${validPath(path)}?${buildQuery(params)}`;

    const [socketUrl, setSocketUrl] = useState(getUrl(path, params));

    const setUrl = (path: string, params: Record<string, string> = {}) => setSocketUrl(getUrl(path, params));

    const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
        shouldReconnect: (event) => {
            const now = Date.now();

            if (event.code !== 4401) return false;
            if (lastReconnectRef.current && now - lastReconnectRef.current < 30_000) return false;

            lastReconnectRef.current = now;
            refreshTokens();
            return true;
        },
    });

    const connectionStatus: string = {
        [ReadyState.CONNECTING]: "CONNECTING",
        [ReadyState.OPEN]: "OPEN",
        [ReadyState.CLOSING]: "CLOSING",
        [ReadyState.CLOSED]: "CLOSED",
        [ReadyState.UNINSTANTIATED]: "UNINSTANTIATED",
    }[readyState];

    return {
        setUrl,
        lastJsonMessage,
        connectionStatus,
    };
};

export default useApiWebSocket;
