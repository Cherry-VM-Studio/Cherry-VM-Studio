import { Group, Indicator, Stack } from "@mantine/core";
import { IconBook2, IconBrandGithub, IconBriefcase, IconCopyright, IconExternalLink, IconLogout } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation.ts";
import LanguageSwitch from "../../interactive/LanguageSwitch/LanguageSwitch.jsx";
import TooltipNavButton from "../../interactive/TooltipNavButton/TooltipNavButton.tsx";
import classes from "./Navbar.module.css";
import { useAuthentication } from "../../../../contexts/AuthenticationContext.tsx";
import { Page } from "../../../../types/config.types.ts";
import NavButton from "../../../atoms/interactive/NavButton/NavButton.tsx";
import { projectLinks } from "../../../../config/project.config.ts";
import ProfileButton from "../../interactive/ProfileButton/ProfileButton.tsx";

export interface NavbarProps {
    pages: Page[];
    bottomPages?: Page[];
}

export default function Navbar({ pages, bottomPages = [] }: NavbarProps): React.ReactElement {
    const { t, tns } = useNamespaceTranslation("layouts");
    const location = useLocation();
    const [active, setActive] = useState<string>();

    useEffect(() => setActive(location.pathname), [location.pathname]);

    return (
        <Stack className={classes.navbar}>
            <Stack
                align="center"
                gap="md"
            >
                {pages.map((category, i) => (
                    <TooltipNavButton
                        key={i}
                        component={Link}
                        to={category.path}
                        active={active?.startsWith(category.path)}
                        label={tns(`navbar.${category.key}`)}
                        icon={<category.icon stroke={1.5} />}
                        disabled={category.disabled}
                    />
                ))}
            </Stack>
            <Stack align="center">
                {bottomPages.map((category, i) => (
                    <TooltipNavButton
                        key={i}
                        component={Link}
                        to={category.path}
                        active={active?.startsWith(category.path)}
                        label={tns(`navbar.${category.key}`)}
                        icon={<category.icon stroke={1.5} />}
                        disabled={category.disabled}
                    />
                ))}
                <TooltipNavButton
                    component="a"
                    label={
                        <Group
                            gap="4"
                            align="center"
                        >
                            {t("github-repository")}
                            <IconExternalLink
                                size={18}
                                stroke={2.2}
                            />
                        </Group>
                    }
                    href={projectLinks.github}
                    icon={<IconBrandGithub />}
                />
                <LanguageSwitch />
                <ProfileButton />
            </Stack>
        </Stack>
    );
}
