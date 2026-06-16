import { IconBrandGithub, IconBrandInstagram, IconBrandLinkedin, IconMailOpened, IconWorld } from "@tabler/icons-react";
import { Contributor, Dependencies, Dependency } from "../types/config.types";

export const projectLinks = {
    github: "https://github.com/Cherry-VM-Studio/Cherry-VM-Studio",
    documentation: "https://cherry-vm-studio.github.io/Cherry-VM-Studio/",
};

export const contributors: Contributor[] = [
    {
        name: "Krzysztof Kolasiński",
        type: "developer",
        avatar: "https://github.com/Krzysztoff27.png",
        fallbackAvatar: "/avatars/Krzysztoff27.png",
        socials: [
            { name: "Github", url: "https://github.com/Krzysztoff27", icon: IconBrandGithub },
            { name: "LinkedIn", url: "https://www.linkedin.com/in/krzysztoff-kolasinski/", icon: IconBrandLinkedin },
            { name: "Email", url: "mailto:krzysztof.kolasinski27@gmail.com", icon: IconMailOpened },
        ],
        contributionKeys: ["virtualization", "networking", "cybersecurity", "api-layer"],
        descriptionKey: "kk",
    },
    {
        name: "Tomasz Kośla",
        type: "developer",
        avatar: "https://github.com/Th3TK.png",
        fallbackAvatar: "/avatars/Th3TK.png",
        socials: [
            { name: "Github", url: "https://github.com/Th3TK", icon: IconBrandGithub },
            { name: "LinkedIn", url: "https://www.linkedin.com/in/tomasz-ko%C5%9Bla-68077432a/", icon: IconBrandLinkedin },
            { name: "Email", url: "mailto:tomasz.kosla.co@gmail.com", icon: IconMailOpened },
        ],
        contributionKeys: ["web-applications", "ui-ux", "api-layer", "auth-system", "branding"],
        descriptionKey: "tk",
    },
    {
        name: "Maja Cegłowska",
        type: "helper",
        avatar: "/avatars/MC.png",
        fallbackAvatar: "",
        socials: [{ name: "Instagram", url: "https://www.instagram.com/majso0n_/", icon: IconBrandInstagram }],
        contributionKeys: ["graphics", "ui-design"],
    },
];

export const FRONTEND_DEPENDENCIES: Dependencies = {
    major: [
        {
            logo: "/logos/external/react.svg",
            name: "React",
            links: [
                { name: "Website", url: "https://react.dev", icon: IconWorld },
                { name: "Github", url: "https://github.com/facebook/react", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/facebook/react?tab=MIT-1-ov-file#readme",
            },
        },
        {
            logo: "/logos/external/mantine.svg",
            name: "Mantine",
            links: [
                { name: "Website", url: "https://mantine.dev", icon: IconWorld },
                { name: "Github", url: "https://github.com/mantinedev/mantine", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/mantinedev/mantine?tab=MIT-1-ov-file#readme",
            },
        },
        {
            logo: "/logos/external/tabler.svg",
            name: "Tabler Icons",
            links: [
                { name: "Website", url: "https://tabler.io/icons", icon: IconWorld },
                { name: "Github", url: "https://github.com/tabler/tabler-icons", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/tabler/tabler-icons?tab=MIT-1-ov-file#readme",
            },
        },
        {
            logo: "/logos/external/tanstack.png",
            name: "Tanstack Table",
            links: [
                { name: "Website", url: "https://tanstack.com/table/", icon: IconWorld },
                { name: "Github", url: "https://github.com/TanStack/table", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/TanStack/table?tab=MIT-1-ov-file#readme",
            },
        },
        {
            logo: "/logos/external/axios.svg",
            name: "Axios",
            links: [
                { name: "Website", url: "https://axios-http.com/", icon: IconWorld },
                { name: "Github", url: "https://github.com/axios/axios", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/axios/axios?tab=MIT-1-ov-file#readme",
            },
        },
        {
            logo: "/logos/external/xyflow.png",
            name: "React Flow",
            links: [
                { name: "Website", url: "https://reactflow.dev", icon: IconWorld },
                { name: "Github", url: "https://github.com/xyflow/xyflow", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/xyflow/xyflow?tab=MIT-1-ov-file#readme",
            },
        },
    ],
    minor: ["classnames", "framer-motion", "i18next", "lodash", "react-cookkie", "react-editext", "recharts", "uuid"],
};

export const BACKEND_DEPENDENCIES: Dependencies = {
    major: [
        {
            logo: "/logos/external/Traefik Proxy.webp",
            name: "Traefik",
            links: [
                { name: "Website", url: "https://traefik.io/traefik", icon: IconWorld },
                { name: "Github", url: "https://github.com/traefik/traefik", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/traefik/traefik?tab=MIT-1-ov-file#readme",
            },
        },
        {
            logo: "/logos/external/libvirt.png",
            name: "Libvirt",
            links: [
                { name: "Website", url: "https://libvirt.org/", icon: IconWorld },
                { name: "Github", url: "https://github.com/libvirt/libvirt", icon: IconBrandGithub },
            ],
            license: {
                name: "LGPL 2.1 License",
                url: "https://github.com/libvirt/libvirt/blob/master/COPYING.LESSER",
            },
        },
        {
            logo: "/logos/external/Apache Guacamole.webp",
            name: "Apache Guacamole",
            links: [{ name: "Website", url: "https://guacamole.apache.org/", icon: IconWorld }],
            license: {
                name: "Apache License 2.0",
                url: "https://www.apache.org/licenses/LICENSE-2.0",
            },
        },
        {
            logo: "/logos/external/FastAPI.png",
            name: "FastAPI",
            links: [
                { name: "Website", url: "https://fastapi.tiangolo.com/", icon: IconWorld },
                { name: "Github", url: "https://github.com/fastapi/fastapi", icon: IconBrandGithub },
            ],
            license: {
                name: "MIT License",
                url: "https://github.com/fastapi/fastapi?tab=MIT-1-ov-file#readme",
            },
        },
    ],
    minor: [],
    minorPython: [
        "PyJWT",
        "passlib",
        "bcrypt",
        "pydantic",
        "python-dotenv",
        "pythom-pam",
        "six",
        "libvirt-python",
        "psycopg",
        "streaming-form-data",
        "numpy",
        "devtools",
    ],
};
