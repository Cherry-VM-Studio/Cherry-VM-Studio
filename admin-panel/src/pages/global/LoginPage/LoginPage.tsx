import { Center, Fieldset, Group, Avatar, Space, Divider, TextInput, PasswordInput, Button, Text } from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../../contexts/AuthenticationContext";
import useApi from "../../../hooks/useApi";
import { TokenRequestForm } from "../../../types/api.types.ts";
import LanguageSwitch from "../../../components/molecules/interactive/LanguageSwitch/LanguageSwitch.jsx";
import { projectLinks } from "../../../config/project.config.ts";
import TooltipNavButton from "../../../components/molecules/interactive/TooltipNavButton/TooltipNavButton.tsx";
import { IconBook2, IconBrandGithub } from "@tabler/icons-react";

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { sendRequest } = useApi();
    const { setAccessToken, setRefreshToken } = useAuthentication();

    const form = useForm<TokenRequestForm>({
        mode: "uncontrolled",
        validate: {
            username: isNotEmpty(),
            password: isNotEmpty(),
        },
    });

    const onSubmit = form.onSubmit(async (values: TokenRequestForm) => {
        const jsonResponse = await sendRequest("POST", "/token", {
            data: new URLSearchParams({
                username: values.username,
                password: values.password,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (!jsonResponse?.access_token) return;

        setAccessToken(jsonResponse.access_token);
        setRefreshToken(jsonResponse.refresh_token);
        navigate("/client/home");
        notifications.clean();
    });

    return (
        <form onSubmit={onSubmit}>
            <Group
                pos="absolute"
                p="md"
                pr="lg"
                justify="end"
                gap="xs"
                w="100%"
            >
                <LanguageSwitch
                    withTooltip={false}
                    position="bottom"
                />
                <TooltipNavButton
                    component="a"
                    href={projectLinks.documentation}
                    icon={<IconBook2 />}
                />
                <TooltipNavButton
                    component="a"
                    href={projectLinks.github}
                    icon={<IconBrandGithub />}
                />
            </Group>
            <Center h={"100vh"}>
                <Fieldset w="400">
                    <Group pt="xs">
                        <Avatar
                            src="/logos/CVMS/Cherry VM Studio Logo Small.webp"
                            radius={0}
                        />
                        <Text
                            size="xl"
                            fw={500}
                        >
                            {t("login.title", { ns: "pages" })}
                        </Text>
                    </Group>
                    <Space h="sm" />
                    <Divider label={t("login.description", { ns: "pages" })} />
                    <Space h="sm" />
                    <TextInput
                        label={t("username")}
                        description=" " // for a small gap
                        placeholder={t("login.username-placeholder", { ns: "pages" })}
                        withAsterisk
                        key={form.key("username")}
                        {...form.getInputProps("username")}
                    />
                    <Space h="sm" />
                    <PasswordInput
                        label={t("password")}
                        description=" " // for a small gap
                        placeholder={t("login.password-placeholder", { ns: "pages" })}
                        withAsterisk
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                    />
                    <Group
                        justify="space-between"
                        mt="md"
                    >
                        <Button
                            onClick={() => navigate("/")}
                            style={{ fontWeight: 500 }}
                            color="dark.1"
                            variant="light"
                        >
                            {t("go-back")}
                        </Button>
                        <Button type="submit">{t("log-in")}</Button>
                    </Group>
                </Fieldset>
            </Center>
        </form>
    );
}
