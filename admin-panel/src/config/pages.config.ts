import {
    IconBriefcase,
    IconCategory,
    IconDatabase,
    IconDeviceDesktop,
    IconHome,
    IconLibrary,
    IconTemplate,
    IconTopologyStar,
    IconUserHexagon,
    IconUsers,
    IconUsersGroup,
    IconCopyright,
} from "@tabler/icons-react";
import { Page } from "../types/config.types";
import PERMISSIONS from "./permissions.config";
import IconFileTypeIso from "../components/atoms/icons/IconFileTypeIso/IconFileTypeIso";

export const ADMIN_PANEL_PAGES: Page[] = [
    {
        key: "home",
        path: "/admin/home",
        icon: IconHome,
    },
    {
        key: "machines",
        path: "/admin/machines",
        icon: IconDeviceDesktop,
        subpages: [
            {
                key: "your-library",
                path: "/admin/machines",
                icon: IconCategory,
            },
            {
                key: "all-machines",
                path: "/admin/machines/all",
                icon: IconDatabase,
                permissions: PERMISSIONS.VIEW_ALL_VMS,
            },
            {
                key: "templates",
                path: "/admin/machines/templates",
                icon: IconTemplate,
            },
            {
                key: "snapshots",
                path: "/admin/machines/snapshots",
                icon: IconLibrary,
                disabled: true,
            },
            {
                key: "iso",
                path: "/admin/machines/iso",
                icon: IconFileTypeIso,
            },
        ],
    },
    {
        key: "accounts",
        path: "/admin/accounts",
        icon: IconUsersGroup,
        subpages: [
            {
                key: "administrators",
                path: "/admin/accounts/admins",
                icon: IconUserHexagon,
            },
            {
                key: "clients",
                path: "/admin/accounts/clients",
                icon: IconUsers,
            },
            {
                key: "groups",
                path: "/admin/accounts/groups",
                icon: IconUsersGroup,
            },
        ],
    },
    {
        key: "network-panel",
        path: "/admin/network-panel",
        icon: IconTopologyStar,
    },
];

export const CLIENT_PANEL_PAGES: Page[] = [
    {
        key: "home",
        path: "/client/home",
        icon: IconHome,
    },
    {
        key: "machines",
        path: "/client/machines",
        icon: IconDeviceDesktop,
    },
];

export const ADMIN_PANEL_BOTTOM_PAGES: Page[] = [
    {
        key: "copyright",
        path: "/admin/copyright",
        icon: IconCopyright,
    },
    {
        key: "contributors",
        path: "/admin/contributors",
        icon: IconBriefcase,
    },
];

export const CLIENT_PANEL_BOTTOM_PAGES: Page[] = [
    {
        key: "copyright",
        path: "/client/copyright",
        icon: IconCopyright,
    },
    {
        key: "contributors",
        path: "/client/contributors",
        icon: IconBriefcase,
    },
];
