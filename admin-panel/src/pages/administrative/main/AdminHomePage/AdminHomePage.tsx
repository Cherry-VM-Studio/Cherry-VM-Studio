import { Avatar, Button, Card, Group, Image, List, rem, ScrollArea, SimpleGrid, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import urlConfig from "../../../../config/url.config";
import classes from "./AdminHomePage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import GreetingTitle from "../../../../components/atoms/display/GreetingTitle/GreetingTitle";

const panels = [
    {
        name: "guacamole",
        link: urlConfig.guacamole,
        color: "#578c34",
        icon: "/logos/external/Apache Guacamole.webp",
    },
    {
        name: "traefik",
        link: urlConfig.traefik,
        color: "#24A0C1",
        icon: "/logos/external/Traefik Proxy.webp",
    },
];

function AdminHomePage() {
    const { t, tns } = useNamespaceTranslation("pages", "admin-home");

    const cards = panels.map((panel, i) => (
        <Card
            key={i}
            shadow="sm"
            className={classes.card}
            withBorder
        >
            <Stack className={classes.cardStack1}>
                <Stack className={classes.cardStack2}>
                    <Group className={classes.cardGroup}>
                        <Avatar
                            src={panel.icon}
                            title={tns(`cards.${panel.name}.title`)}
                            alt={tns(`cards.${panel.name}.logo-alt`)}
                        />
                        <Text className={classes.panelTitle}>{tns(`cards.${panel.name}.title`)}</Text>
                    </Group>
                    <Text
                        size="sm"
                        c="dimmed"
                    >
                        {tns(`cards.${panel.name}.description`)}
                    </Text>
                </Stack>
                <Button
                    component="a"
                    href={panel.link}
                    color={panel.color}
                    radius="md"
                    fullWidth
                >
                    {t("log-in")}
                </Button>
            </Stack>
        </Card>
    ));

    return (
        <>
            <ScrollArea w="100%">
                <Stack className={classes.container}>
                    <Stack align="center">
                        <GreetingTitle />
                        <Text className={classes.description}>{tns("description1")}</Text>
                    </Stack>
                    <Card
                        className={`${classes.card} ${classes.main}`}
                        shadow="sm"
                        withBorder
                    >
                        <Group>
                            <Image
                                src="/logos/CVMS/Cherry VM Studio Logo Small.webp"
                                fit="contain"
                                mah={200}
                                flex={1}
                            />
                            <Stack gap="0">
                                <Text>
                                    {tns("cherry-admin-panel.start", {
                                        ns: "pages",
                                    })}
                                </Text>
                                <List mt={rem(4)}>
                                    <List.Item>{tns("cherry-admin-panel.feature1")}</List.Item>
                                    <List.Item>{tns("cherry-admin-panel.feature2")}</List.Item>
                                    <List.Item>{tns("cherry-admin-panel.feature3")}</List.Item>
                                    <List.Item>
                                        <Text c="dimmed">{tns("cherry-admin-panel.feature-more")}</Text>
                                    </List.Item>
                                </List>
                                <Button
                                    component={Link}
                                    to="/admin/machines"
                                    color="cherry.11"
                                    radius="md"
                                    mt="md"
                                    fullWidth
                                >
                                    {tns("start-managing")}
                                </Button>
                            </Stack>
                        </Group>
                    </Card>
                    <Text className={classes.description}>
                        {tns("description2", {
                            ns: "pages",
                        })}
                    </Text>
                    <SimpleGrid
                        cols={2}
                        w={800}
                    >
                        {...cards}
                    </SimpleGrid>
                </Stack>
            </ScrollArea>
        </>
    );
}

export { AdminHomePage as default };
