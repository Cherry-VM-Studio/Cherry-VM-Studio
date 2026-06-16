import { Anchor, Group, Stack, StackProps, Text, Title } from "@mantine/core";
import classes from "../CopyrightPage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { BACKEND_DEPENDENCIES, FRONTEND_DEPENDENCIES } from "../../../../config/project.config";
import DependencyCard from "../../../../components/atoms/display/DependencyCard/DependencyCard";
import { CopyrightPageSlideProps } from "../CopyrightPage";
import { IconExternalLink } from "@tabler/icons-react";
import { Fragment } from "react";
import { shuffle } from "lodash";

const ThirdPartySlide = ({ slide, setSlide, ...props }: CopyrightPageSlideProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("pages", "credits");

    return (
        <Stack
            id="third-party"
            className={classes.thirdParty}
            {...props}
        >
            <Title
                order={1}
                ff="poppins"
            >
                {tns("third-party.title")}
            </Title>
            <Text className={classes.description}>{tns("third-party.description.1")}</Text>
            <Title
                order={3}
                mt="lg"
            >
                {tns("third-party.backend")}
            </Title>
            <Text>{tns("third-party.backend-description")}</Text>
            <Title order={4}>{tns("third-party.key-dependencies")}:</Title>
            <Group>
                {BACKEND_DEPENDENCIES.major.map((dependency, i) => (
                    <DependencyCard
                        dependency={dependency}
                        key={i}
                    />
                ))}
            </Group>
            <Stack gap="xs">
                <Title order={4}>{tns("third-party.additional-packages")}:</Title>
                <Text>
                    {shuffle(BACKEND_DEPENDENCIES.minorPython).map((dependency, i) => (
                        <Fragment key={i}>
                            <Anchor
                                href={`https://pypi.org/project/${dependency}`}
                                c="var(--mantine-color-text)"
                                underline="never"
                                style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}
                            >
                                    <span>{dependency}</span>
                                    <IconExternalLink
                                        size={16}
                                        stroke={2.5}
                                    />
                            </Anchor>

                            {i < BACKEND_DEPENDENCIES.minorPython.length - 1 && <span>, </span>}
                        </Fragment>
                    ))}
                </Text>
            </Stack>

            <Title
                order={3}
                mt="xl"
            >
                {tns("third-party.frontend")}
            </Title>
            <Text>{tns("third-party.frontend-description")}</Text>
            <Title order={4}>{tns("third-party.key-dependencies")}:</Title>
            <Group>
                {FRONTEND_DEPENDENCIES.major.map((dependency, i) => (
                    <DependencyCard
                        dependency={dependency}
                        key={i}
                    />
                ))}
            </Group>
            <Stack gap="xs">
                <Title order={4}>{tns("third-party.additional-packages")}:</Title>
                <Text>
                    {shuffle(FRONTEND_DEPENDENCIES.minor).map((dependency, i) => (
                        <Fragment key={i}>
                            <Anchor
                                href={`https://npmjs.com/package/${dependency}`}
                                c="var(--mantine-color-text)"
                                underline="never"
                                style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}
                            >
                                
                                    <span>{dependency}</span>
                                    <IconExternalLink
                                        size={16}
                                        stroke={2.5}
                                    />
                                
                            </Anchor>

                            {i < FRONTEND_DEPENDENCIES.minor.length - 1 && <span>, </span>}
                        </Fragment>
                    ))}
                </Text>
            </Stack>
        </Stack>
    );
};

export default ThirdPartySlide;
