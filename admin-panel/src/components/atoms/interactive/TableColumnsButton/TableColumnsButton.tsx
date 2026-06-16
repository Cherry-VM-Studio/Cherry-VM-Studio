import { ActionIcon, Box, Checkbox, Menu, ScrollArea, Stack, Text } from "@mantine/core";
import { MantineActionIconAllProps } from "../../../../types/mantine.types";
import { Column } from "@tanstack/react-table";
import { isString } from "lodash";
import classes from "./TableColumnsButton.module.css";
import React from "react";

export interface TableColumnsButtonProps extends MantineActionIconAllProps {
    columns: Column<any, any>[];
    visibleColumns: Column<any, any>[];
}

const TableColumnsButton = ({ columns, visibleColumns, ...props }: TableColumnsButtonProps): React.JSX.Element => {
    return (
        <Menu>
            <Menu.Target>
                <ActionIcon {...props}></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown className={classes.dropdown}>
                <Text
                    size="sm"
                    fw="500"
                >
                    Toggle columns
                </Text>
                <ScrollArea.Autosize
                    scrollbarSize="0.625rem"
                    offsetScrollbars
                    type="always"
                >
                    <Stack>
                        {columns
                            .filter((col) => col.getCanHide() && isString(col.columnDef.header))
                            .map((col, i) => (
                                <Box
                                    className={classes.item}
                                    key={i}
                                >
                                    <Checkbox
                                        classNames={{ input: classes.input }}
                                        label={col.columnDef.header as string}
                                        checked={col.getIsVisible()}
                                        onChange={() => col.toggleVisibility()}
                                    />
                                </Box>
                            ))}
                    </Stack>
                </ScrollArea.Autosize>
            </Menu.Dropdown>
        </Menu>
    );
};

export default TableColumnsButton;
