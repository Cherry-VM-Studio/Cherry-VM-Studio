import { ActionIcon, Card, Group, Stack, Text, Title } from "@mantine/core";
import classes from "../CopyrightPage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { CopyrightPageSlideProps } from "../CopyrightPage";
import { useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { CC_BY_NC_ND_4_0 } from "../Licenses";

const BrandingSlide = ({ slide, setSlide, ...props }: CopyrightPageSlideProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("pages", "credits");
    const [logoLightMode, setLogoLightMode] = useState(false);

    return (
        <Stack
            id="branding"
            className={classes.branding}
            align="top"
            {...props}
        >
            <Stack>
                <Title
                    order={1}
                    ff="poppins"
                >
                    {tns("branding.title")}
                </Title>
                <Text className={classes.description}>{tns("branding.description.1")}</Text>
                <Text className={classes.description}>{`${tns("branding.description.2")} ${tns("branding.description.3")}`}</Text>
            </Stack>
            <Stack
                w="fit-content"
                mt="-32px"
            >
                <ActionIcon
                    ml="auto"
                    size="lg"
                    variant={logoLightMode ? "white" : "default"}
                    color={logoLightMode ? "black" : "white"}
                    onClick={() => setLogoLightMode((prev) => !prev)}
                >
                    {logoLightMode ? <IconSun size={22} /> : <IconMoon size={22} />}
                </ActionIcon>
                <Card
                    className={classes.logosCard}
                    bg={logoLightMode ? "white" : undefined}
                    c={logoLightMode ? "black" : "dimmed"}
                >
                    <Group gap="xl">
                        <Stack>
                            <img
                                src={"/logos/CVMS/Cherry VM Studio Logo Light.webp"}
                                style={{ display: logoLightMode ? "block" : "none" }}
                                className={classes.brandingAsset}
                            />
                            <img
                                src={"/logos/CVMS/Cherry VM Studio Logo Dark.webp"}
                                style={{ display: logoLightMode ? "none" : "block" }}
                                className={classes.brandingAsset}
                            />

                            <Text className={classes.caption}>CVMS Full Logo</Text>
                        </Stack>

                        <Stack>
                            <img
                                src="/logos/CVMS/Cherry VM Studio Logo Small.webp"
                                className={classes.brandingAsset}
                            />
                            <Text className={classes.caption}>CVMS Small Logo</Text>
                        </Stack>

                        <Stack ml="lg">
                            <img
                                src="/logos/CVMS/Cherry VM Studio Icon.webp"
                                className={classes.brandingAsset}
                            />
                            <Text className={classes.caption}>CVMS Icon</Text>
                        </Stack>
                    </Group>
                </Card>
            </Stack>
            <Text className={classes.description}>
                {tns("branding.description.4")} {CC_BY_NC_ND_4_0}
            </Text>
        </Stack>
    );
};

export default BrandingSlide;
