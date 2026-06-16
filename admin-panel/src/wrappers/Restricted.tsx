import React from "react";
import useFetch from "../hooks/useFetch";

const Restricted = ({ children, requiredPermissions }: { children: any; requiredPermissions: number }): React.JSX.Element => {
    const { data: user, loading, error } = useFetch("/users/me");

    const hasPermissions = (user?.permissions | requiredPermissions) === requiredPermissions;

    if (!user || loading || error || !hasPermissions) return;
    return children;
};

export default Restricted;
