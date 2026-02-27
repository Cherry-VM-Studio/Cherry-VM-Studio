import { ActionIcon, Button } from "@mantine/core";
import { TableControlsDefaultButtonsConfig, TableControlsIcons, TableControlsTranslations } from "./TableControls.types";
import ExpandingButton from "../../../atoms/interactive/ExpandingButton/ExpandingButton";
import TableColumnsButton from "../../../atoms/interactive/TableColumnsButton/TableColumnsButton";
import { Table } from "@tanstack/react-table";

const getDefaultButtons = (
    table: Table<any>,
    icons: TableControlsIcons,
    translations: TableControlsTranslations,
    viewMode: boolean,
    deleteMode: boolean,
): TableControlsDefaultButtonsConfig => ({
    columns: {
        small: {
            name: "columns",
            component: TableColumnsButton,
            props: {
                size: "36",
                variant: "default",
                columns: table.getAllColumns(),
                visibleColumns: table.getVisibleLeafColumns(),
            },
            children: <icons.columns size={20} />,
        },
    },
    filter: {
        small: {
            name: "filter",
            component: ActionIcon,
            props: {
                size: "36",
                variant: "default",
                disabled: true,
            },
            children: <icons.filter size={20} />,
        },
        large: {
            name: "filter",
            component: Button,
            props: {
                fw: 400,
                w: 120,
                variant: "default",
                leftSection: <icons.filter size={16} />,
                disabled: true,
            },
            children: translations.filter,
        },
    },
    import: {
        small: {
            name: "import",
            component: ActionIcon,
            props: {
                size: "36",
                variant: "default",
            },
            children: <icons.import size={20} />,
        },
        large: {
            name: "import",
            component: Button,
            props: {
                fw: 400,
                w: 140,
                variant: "default",
                leftSection: <icons.import size={16} />,
            },
            children: translations.import,
        },
    },
    create: {
        small: {
            name: "create",
            component: ActionIcon,
            props: {
                size: 36,
                color: "black",
                variant: "white",
                disabled: viewMode,
            },
            children: (
                <icons.create
                    size={20}
                    stroke={3}
                />
            ),
        },
        large: {
            name: "create",
            component: Button,
            props: {
                w: 180,
                color: "black",
                variant: "white",
                disabled: viewMode,
                leftSection: (
                    <icons.create
                        size={16}
                        stroke={3}
                    />
                ),
            },
            children: translations.create,
        },
    },
    delete: {
        small: {
            name: "delete",
            component: ExpandingButton,
            props: {
                ButtonComponent: ActionIcon,
                mounted: deleteMode,
                w: 36,
                h: 36,
                parentGap: "1rem",
                variant: "filled",
                color: "cherry.9",
                disabled: viewMode,
            },
            children: (
                <icons.delete
                    size={20}
                    stroke={3}
                />
            ),
        },
        large: {
            name: "delete",
            component: ExpandingButton,
            props: {
                ButtonComponent: Button,
                mounted: deleteMode,
                w: 180,
                parentGap: "1rem",
                variant: "filled",
                color: "cherry.9",
                leftSection: (
                    <icons.delete
                        size={16}
                        stroke={3}
                    />
                ),
                disabled: viewMode,
            },
            children: translations.delete,
        },
    },
});

export default getDefaultButtons;
