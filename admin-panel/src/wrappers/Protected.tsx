import { Navigate, Outlet } from "react-router-dom";
import useFetch from "../hooks/useFetch.ts";
import Loading from "../components/atoms/feedback/Loading/Loading.tsx";
import { AccountType } from "../types/config.types.ts";
import { ERRORS } from "../config/errors.config.ts";
import { isEmpty } from "lodash";
import { User } from "../types/api.types.ts";

export interface ProtectedProps {
    accountType: AccountType;
}

export const Protected = ({ accountType }: ProtectedProps): React.JSX.Element => {
    const { error, loading, data: user } = useFetch<User>("/users/me");

    document.title = accountType === "administrative" ? "Cherry Admin Panel" : "Cherry Client Panel";

    if (loading) return <Loading />;

    if (error || isEmpty(user)) {
        if (error.status === ERRORS.HTTP_401_UNAUTHORIZED)
            return (
                <Navigate
                    to="/login"
                    replace
                />
            );
        throw error;
    }

    if (user.account_type !== accountType)
        return (
            <Navigate
                to={`/${accountType === "administrative" ? "client" : "admin"}/home`}
                replace
            />
        );

    return <Outlet />;
};

export default Protected;
