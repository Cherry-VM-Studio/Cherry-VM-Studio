import React, { useMemo } from "react";
import BusinessCardCell from "../../../atoms/table/BusinessCardCell";
import { Box, Button, MantineSize, ScrollArea, Stack } from "@mantine/core";
import { IconLinkOff, IconUsers } from "@tabler/icons-react";
import { CellContext, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import classes from "./MembersTable.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import ResourceError from "../../../atoms/feedback/ResourceError/ResourceError";
import ResourceLoading from "../../../atoms/feedback/ResourceLoading/ResourceLoading";
import { User, UserExtended } from "../../../../types/api.types";

export interface MembersTableProps {
    usersData: User[] | UserExtended[];
    removeMember: (uuid: string) => void;
    error: any;
    loading: boolean;
    size?: MantineSize | string | number;
    avatarSize?: MantineSize | string | number;
}

const MembersTable = ({ usersData, removeMember, error, loading, size = "sm", avatarSize = "md" }: MembersTableProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("modals", "group");

    const data = useMemo(
        () =>
            usersData?.map?.(({ uuid, name, surname, username, email }) => ({
                uuid,
                details: { name, surname, email, username },
            })) ?? [],
        [usersData],
    );

    const columns = useMemo(
        () => [
            {
                accessorKey: "details",
                header: "",
                cell: (props: CellContext<unknown, UserExtended>) => (
                    <BusinessCardCell
                        {...props}
                        size={size}
                        avatarSize={avatarSize}
                    />
                ),
            },
            {
                accessorKey: "options",
                header: "",
                cell: ({ row }: CellContext<unknown, unknown>) => (
                    <Button
                        color="cherry"
                        variant="light"
                        leftSection={<IconLinkOff size={16} />}
                        size="xs"
                        onClick={() => removeMember(row.id)}
                    >
                        {tns("remove-user")}
                    </Button>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: data,
        columns: columns,
        getRowId: (row: any) => row.uuid,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}></Stack>
            <Box className={classes.table}>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Box
                        className={classes.tr}
                        key={headerGroup.id}
                    >
                        {headerGroup.headers.map((header) => (
                            <Box
                                className={classes.th}
                                key={header.id}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </Box>
                        ))}
                    </Box>
                ))}
                {error ? (
                    <ResourceError
                        icon={IconUsers}
                        message={t("error-users")}
                    />
                ) : loading ? (
                    <ResourceLoading
                        icon={IconUsers}
                        message={t("loading-users")}
                    />
                ) : (
                    <ScrollArea scrollbars="y">
                        {table.getRowModel().rows.map((row) => (
                            <Box
                                className={`${classes.tr} ${row.getIsSelected() ? classes.selected : ""}`}
                                key={row.id}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <Box
                                        className={classes.td}
                                        key={cell.id}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </ScrollArea>
                )}
            </Box>
        </Stack>
    );
};

export default MembersTable;
