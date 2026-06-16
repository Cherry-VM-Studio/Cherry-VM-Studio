import { TablerIcon } from "@tabler/icons-react";
import { ComponentType } from "react";

export interface TableControlsButtonOptions {
    component?: ComponentType<any>;
    props?: Record<string, any>;
    children?: any;
}

export interface TableControlsButton {
    name: string;
    component: ComponentType<any>;
    position?: number;
    props?: Record<string, any>;
    children?: any;
}

export interface TableControlsModal {
    component: ComponentType<any>;
    props?: { [key: string]: any };
}

export type TableControlsDefaultButtons = "create" | "delete" | "import" | "filter" | "columns";

export type TableControlsDefaultButtonsConfig = {
    [K in TableControlsDefaultButtons]: {
        small?: TableControlsButton;
        large?: TableControlsButton;
    };
};

export type TableControlsTranslations = {
    [K in TableControlsDefaultButtons]?: string;
};

export type TableControlsIcons = {
    [K in TableControlsDefaultButtons]?: TablerIcon;
};

export type TableControlsOptions = {
    [K in TableControlsDefaultButtons]?: TableControlsButtonOptions;
};

export type TableControlsHiddenButtons = {
    [K in TableControlsDefaultButtons]?: boolean;
};

export type TableControlsModals = {
    [K in TableControlsDefaultButtons]?: TableControlsModal;
} & {
    [key: string]: TableControlsModal;
};

export interface TableControlsProps {
    table: any;
    translations: TableControlsTranslations;
    modals?: TableControlsModals;
    options?: TableControlsOptions;
    hiddenButtons?: TableControlsHiddenButtons;
    additionalButtons?: TableControlsButton[];
    viewMode?: boolean;
    icons?: TableControlsIcons;
    searchColumnKey?: string;
    onFilteringChange?: React.Dispatch<React.SetStateAction<any>>;
}
