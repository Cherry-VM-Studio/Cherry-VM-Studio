import { ScrollArea, SimpleGrid } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { keys, round } from "lodash";
import classes from "./MachinesGrid.module.css";
import MachineCard from "../../../atoms/display/MachineCard/MachineCard";
import { Machine } from "../../../../types/api.types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { IconDeviceDesktop } from "@tabler/icons-react";
import ResourceLoading from "../../../atoms/feedback/ResourceLoading/ResourceLoading";
import ResourceError from "../../../atoms/feedback/ResourceError/ResourceError";
import { Table } from "@tanstack/react-table";

export interface MachinesGridProps {
    table: Table<any>;
    machines: Record<string, Machine>;
    loading: boolean;
    error: AxiosError | null;
    rows?: number;
}

const MachinesGrid = ({ table, machines, loading, error }: MachinesGridProps): React.JSX.Element => {
    const { width, ref } = useElementSize();
    const { t } = useTranslation();

    const cols = round(width / 450);

    const shownMachineUuids = table.getPaginationRowModel().rows.map((row) => row.original.uuid);
    const shownMachines = shownMachineUuids.map((uuid) => machines?.[uuid]).filter((e) => e);

    return (
        <ScrollArea
            ref={ref}
            scrollbars="y"
            offsetScrollbars
            scrollbarSize="0.525rem"
            className={classes.scrollArea}
            classNames={{ content: "auto-width full-height" }}
        >
            {error ? (
                <ResourceError
                    icon={IconDeviceDesktop}
                    message={t("error-machines")}
                    mt="-36px"
                />
            ) : loading ? (
                <ResourceLoading
                    icon={IconDeviceDesktop}
                    message={t("loading-machines")}
                    mt="-36px"
                />
            ) : !keys(machines).length ? (
                <ResourceError
                    icon={IconDeviceDesktop}
                    message={t("empty")}
                    mt="-36px"
                />
            ) : (
                <SimpleGrid cols={cols}>
                    {shownMachines.map((machine, i) => (
                        <MachineCard
                            key={i}
                            machine={machine}
                        />
                    ))}
                </SimpleGrid>
            )}
        </ScrollArea>
    );
};

export default MachinesGrid;
