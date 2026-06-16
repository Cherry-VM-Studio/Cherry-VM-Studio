import { Group } from "@mantine/core";
import React, { useMemo, useCallback } from "react";
import TableSearch from "../TableSearch/TableSearch";
import ModalButton from "../../../atoms/interactive/ModalButton/ModalButton";
import { IconFileImport, IconFilter, IconLayoutColumns, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { entries, isNull, merge } from "lodash";
import { TableControlsButton, TableControlsProps } from "./TableControls.types";
import getDefaultButtons from "./TableControls.config";

const TableControls = ({
    table,
    modals = {},
    additionalButtons = [],
    hiddenButtons = {},
    options = {},
    icons: customIcons = {},
    translations,
    viewMode = false,
    onFilteringChange,
    searchColumnKey = "details",
}: TableControlsProps): React.JSX.Element => {
    const isXl = useMediaQuery("(min-width: 96em)");
    const isLg = useMediaQuery("(min-width: 84em)");

    const currentVariants = useMemo(
        () => ({
            create: isLg ? "large" : "small",
            delete: isLg ? "large" : "small",
            filter: isXl ? "large" : "small",
            import: isXl ? "large" : "small",
            columns: "small",
        }),
        [isXl, isLg]
    );

    const icons = useMemo(
        () => ({
            create: IconPlus,
            delete: IconTrash,
            filter: IconFilter,
            import: IconFileImport,
            columns: IconLayoutColumns,
            ...customIcons,
        }),
        [customIcons]
    );

    const anyRowsSelected = useCallback(() => table.getIsSomeRowsSelected() || table.getIsAllRowsSelected(), [table]);

    const defaultButtons = getDefaultButtons(table, icons, translations, viewMode, anyRowsSelected());

    let buttons = useMemo(
        () =>
            entries(defaultButtons)
                .map(([key, variants]) => (hiddenButtons[key] ? null : merge(variants[currentVariants[key]], options[key])))
                .filter((e) => !isNull(e)),
        [defaultButtons, currentVariants]
    );

    const insertAtPos = (button: TableControlsButton) => buttons.splice(isNaN(button.position) ? buttons.length : button.position, 0, button);

    additionalButtons?.forEach(insertAtPos);

    const hasModal = useCallback((buttonName: string) => !!modals[buttonName], [modals]);

    return (
        <Group
            justify="flex-end"
            flex="1"
        >
            <TableSearch
                id={searchColumnKey}
                setFilters={onFilteringChange}
                toggleAllRowsSelected={table.toggleAllRowsSelected}
                maw="300"
                miw="100px"
                flex="1"
            />
            {buttons.map((button, i) =>
                hasModal(button.name) ? (
                    <ModalButton
                        key={i}
                        ButtonComponent={button.component}
                        buttonProps={button.props}
                        ModalComponent={modals[button.name]?.component}
                        modalProps={modals[button.name]?.props}
                    >
                        {button.children}
                    </ModalButton>
                ) : (
                    <button.component
                        key={i}
                        {...button.props}
                    >
                        {button.children}
                    </button.component>
                )
            )}
        </Group>
    );
};

export default TableControls;
