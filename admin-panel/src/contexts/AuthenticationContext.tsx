import { AxiosHeaders, isAxiosError } from "axios";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { UserExtended } from "../types/api.types";
import useApi from "../hooks/useApi";

interface Tokens {
    access_token: string | null;
    refresh_token: string | null;
}

export interface AuthenticationContextValue {
    tokens: Tokens;
    authHeaders: AxiosHeaders | null;
    refreshHeaders: AxiosHeaders | null;
    logout: () => void;
    clearTokens: () => void;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
}

const AuthenticationContext = createContext<AuthenticationContextValue | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children?: ReactNode }): ReactNode => {
    const [cookies, setCookies] = useCookies(["access_token", "refresh_token"]);
    const navigate = useNavigate();

    const setToken = (tokenType: "access_token" | "refresh_token", newToken: string | null) => setCookies(tokenType, newToken, { path: "/" });

    const setAccessToken = (token: string | null) => setToken("access_token", token);
    const setRefreshToken = (token: string | null) => setToken("refresh_token", token);

    const clearTokens = () => {
        setAccessToken(null);
        setRefreshToken(null);
    };

    const logout = () => {
        clearTokens();
        navigate("/login");
    };

    const tokens = useMemo(
        () => ({
            access_token: cookies.access_token,
            refresh_token: cookies.refresh_token,
        }),
        [cookies.access_token, cookies.refresh_token],
    );
    const authHeaders = useMemo(
        () =>
            new AxiosHeaders({
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + cookies.access_token,
            }),
        [cookies.access_token],
    );

    const refreshHeaders = useMemo(
        () =>
            new AxiosHeaders({
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + cookies.refresh_token,
            }),
        [cookies.refresh_token],
    );

    const value = {
        tokens,
        authHeaders,
        refreshHeaders,
        logout,
        clearTokens,
        setAccessToken,
        setRefreshToken,
    };

    return <AuthenticationContext.Provider value={value}>{children}</AuthenticationContext.Provider>;
};

export const useAuthentication = () => {
    const ctx = useContext(AuthenticationContext);
    if (!ctx) throw new Error("useAuthentication must be used within an AuthenticationProvider");
    return ctx;
};
