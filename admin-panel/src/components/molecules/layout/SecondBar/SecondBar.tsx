import { Button, Divider, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation.ts";
import classes from "./SecondBar.module.css";
import { Page } from "../../../../types/config.types.ts";
import { usePermissions } from "../../../../contexts/PermissionsContext";

export interface SecondBarProps {
    pages: Page[];
}

export default function SecondBar({ pages }: SecondBarProps): React.ReactElement {
    const { tns } = useNamespaceTranslation("layouts");
    const { hasPermissions } = usePermissions();
    const [page, setPage] = useState<Page>();
    const [active, setActive] = useState<number>();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const page = pages.find((p) => location.pathname.startsWith(p.path));
        setActive(page?.subpages?.findIndex((subpage) => location.pathname == subpage.path) ?? -1);
        setPage(page);
    }, [location.pathname]);

    return (
        <Stack className={classes.navbar}>
            <Divider
                color="dark.5"
                size="sm"
                w="90%"
                mb="0.5rem"
            />
            {page?.subpages.map((subpage, i) => (
                <Button
                    onClick={() => navigate(subpage.path)}
                    justify="left"
                    key={i}
                    variant="subtle"
                    className={`${classes.navButton} ${active === i ? classes.active : ""}`}
                    leftSection={<subpage.icon />}
                    disabled={!hasPermissions(subpage?.permissions || 0) || subpage.disabled}
                >
                    {tns(`navbar.${subpage.key}`)}
                </Button>
            ))}
        </Stack>
    );
}
