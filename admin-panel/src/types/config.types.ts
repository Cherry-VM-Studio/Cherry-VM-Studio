import { IconProps, TablerIcon } from "@tabler/icons-react";
import { ComponentType } from "react";

export interface UrlNode {
    api_requests: string;
    api_websockets: string;
    traefik?: string;
    guacamole?: string;
}

export interface UrlConfig {
    production: UrlNode;
    development: UrlNode;
    staging?: UrlNode;
}

interface Social {
    name: string;
    url: string;
    icon: TablerIcon;
}

export interface Contributor {
    name: string;
    type: "developer" | "helper";
    avatar: string;
    fallbackAvatar: string;
    socials?: Social[];
    contributionKeys?: string[];
    descriptionKey?: string;
}

export interface Page {
    key: string;
    path: string;
    icon: ComponentType<IconProps>;
    subpages?: Page[];
    permissions?: number;
    disabled?: boolean;
}

export type AccountType = "administrative" | "client";

export interface Dependency {
    name: string;
    logo: string;
    links: {
        name: string;
        url: string;
        icon: TablerIcon;
    }[];
    license: {
        name: string;
        url: string;
    };
}

export interface Dependencies {
    major: Dependency[];
    minor: string[];
    [key: string]: any[];
}
