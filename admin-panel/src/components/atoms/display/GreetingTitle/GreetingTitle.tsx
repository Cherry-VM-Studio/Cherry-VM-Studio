import { Title, TitleProps } from "@mantine/core";
import { isNull } from "lodash";
import { useTranslation } from "react-i18next";
import { getFullUserName } from "../../../../utils/users";
import { UserExtended } from "../../../../types/api.types";
import useFetch from "../../../../hooks/useFetch";

const GreetingTitle = (props: TitleProps): React.JSX.Element => {
    const { t } = useTranslation();
    const { data: user, loading, error } = useFetch<UserExtended>("/users/me");

    return <Title {...props}>{isNull(user) ? t("greeting-empty") : t("greeting", { fullname: getFullUserName(user) })}</Title>;
};

export default GreetingTitle;
