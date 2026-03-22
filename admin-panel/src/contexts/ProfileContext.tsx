import { isAxiosError } from "axios";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useCookies } from "react-cookie";
import { UserExtended } from "../types/api.types";
import useApi from "../hooks/useApi";
import { useAuthentication } from "./AuthenticationContext";

export interface ProfileContextValue {
    getProfile: () => UserExtended;
    updateProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider = ({ children }: { children?: ReactNode }): ReactNode => {
    const [cookies, setCookies] = useCookies(["cached_profile"]);
    const { tokens } = useAuthentication();
    const { sendRequest } = useApi();

    const setCachedProfile = (profile: UserExtended | null) => setCookies("cached_profile", profile, { path: "/" });

    const getProfile = () => {
        return cookies.cached_profile as UserExtended;
    };

    const updateProfile = async () => {
        const res = await sendRequest("GET", "/users/me");
        setCachedProfile(isAxiosError(res) ? null : res);
    };

    useEffect(() => {
        updateProfile();
    }, [tokens.access_token, tokens.refresh_token]);

    const value = {
        getProfile,
        updateProfile,
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error("useProfile must be used within an ProfileProvider");
    return ctx;
};
