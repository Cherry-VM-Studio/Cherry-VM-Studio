import Loading from "../components/atoms/feedback/Loading/Loading";
import { Navigate, Outlet } from "react-router-dom";
import useFetch from "../hooks/useFetch";

export const ReverseProtected = (): React.JSX.Element => {
    const { loading, error, data: user } = useFetch("/users/me");

    if (loading) return <Loading />;
    if (error && (error?.code === "ETIMEDOUT" || error.response?.status >= 500)) throw error;
    if (user) return <Navigate to="/client/home" />;

    return <Outlet />;
};

export default ReverseProtected;
