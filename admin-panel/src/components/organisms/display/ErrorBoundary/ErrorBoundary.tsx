import { Button, Center } from "@mantine/core";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import classes from "./ErrorBoundary.module.css";
import { useAuthentication } from "../../../../contexts/AuthenticationContext";
import { isAxiosError } from "axios";
import { isError, isNumber, isString } from "lodash";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";

export default function ErrorBoundary() {
    const { t, tns } = useNamespaceTranslation("errors");
    const { logout } = useAuthentication();
    const navigate = useNavigate();
    const error: unknown = useRouteError();

    const parseError = (): [number | string, string | undefined] => {
        if (isRouteErrorResponse(error)) return [error.status ?? 600, error.data?.message];
        if (isAxiosError(error)) return [error.response?.status || error.code, (error.response?.data as Record<string, any>)?.detail];
        if (isError(error)) return [600, error.message];
        if (isString(error)) return [600, error];

        console.error("ErrorBoundary couldn't parse the error correctly - Error is of unknown type", error);
        return [600, undefined];
    };

    const [code, errorMessage]: [number | string, string | undefined] = parseError();

    const message = isNumber(code) && code >= 600 && errorMessage ? errorMessage : tns(`${code}.message`);

    let buttonMessage: string;
    let onClick: () => void;

    switch (code) {
        case 401:
        case 403:
            onClick = logout;
            buttonMessage = t("log-in-again");
            break;
        case 404:
            onClick = () => navigate(-1);
            buttonMessage = t("take-me-back");
            break;
        default:
            onClick = () => navigate(0);
            buttonMessage = t("refresh-page");
    }

    return (
        <>
            <Center className={classes.background}>{tns(`${code}.code`)}</Center>
            <div className={classes.center}>
                <h1 className={classes.title}>{tns(`${code}.title`)}</h1>
                <span className={classes.message}>{message}</span>
                <Button
                    onClick={onClick}
                    size="lg"
                    w={220}
                >
                    {buttonMessage}
                </Button>
                <Button
                    onClick={() => navigate("/")}
                    size="compact-sm"
                    variant="subtle"
                    w={220}
                >
                    {t("return-to-home-page")}
                </Button>
            </div>
        </>
    );
}
