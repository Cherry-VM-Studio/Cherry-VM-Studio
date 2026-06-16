import React, { createContext, useContext, useCallback, useEffect, useRef } from "react";
import useFetch from "../hooks/useFetch";
import { useAuthentication } from "./AuthenticationContext";
import { Machine, User, UserExtended } from "../types/api.types";
import PERMISSIONS from "../config/permissions.config";

interface PermissionsContextValue {
    hasPermissions: (required: number) => boolean;
    canManageMachine: (user: User | UserExtended, machine: Partial<Machine>) => boolean;
    canConnectToMachine: (user: User | UserExtended, machine: Partial<Machine>) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: permissions, refresh } = useFetch<number>("/users/me/permissions");
    const { tokens } = useAuthentication();
    const previousToken = useRef<string | null>(null);

    const isClientAccount = (perm: number) => perm === -1;

    useEffect(() => {
        if (tokens.access_token && previousToken.current !== tokens.access_token) {
            previousToken.current = tokens.access_token;
            refresh();
        }
    }, [tokens.access_token]);

    const hasPermissions = useCallback(
        (required: number) => permissions != null && !isClientAccount(permissions) && (permissions | required) === permissions,
        [permissions],
    );

    const canManageMachine = (user: User | UserExtended, machine: Partial<Machine>) =>
        (user && machine.owner && user.uuid === machine.owner.uuid) || hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    const canConnectToMachine = (user: User | UserExtended, machine: Partial<Machine>) =>
        user && (canManageMachine(user, machine) || machine.assigned_clients.hasOwnProperty(user.uuid));

    return <PermissionsContext.Provider value={{ hasPermissions, canManageMachine, canConnectToMachine }}>{children}</PermissionsContext.Provider>;
};

export const usePermissions = () => {
    const ctx = useContext(PermissionsContext);

    if (!ctx) throw new Error("usePermissions must be used within a PermissionsProvider");

    return ctx;
};
