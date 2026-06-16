import { Button, Group, Paper, SimpleGrid, Stack, Title } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import useFetch from "../../../../hooks/useFetch";
import { isNull, keys, round, values } from "lodash";
import { useNavigate } from "react-router-dom";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { ERRORS } from "../../../../config/errors.config";
import classes from "./MachinesOverview.module.css";
import { IconDeviceDesktop, IconExternalLink } from "@tabler/icons-react";
import MachinesGrid from "../../../molecules/display/MachinesGrid/MachinesGrid";
import useMachineWebSocket from "../../../../hooks/useMachineWebSocket";
import MachineCard from "../../../atoms/display/MachineCard/MachineCard";
import ResourceError from "../../../atoms/feedback/ResourceError/ResourceError";
import ResourceLoading from "../../../atoms/feedback/ResourceLoading/ResourceLoading";
import { MachineState } from "../../../../types/api.types";
import { useElementSize } from "@mantine/hooks";

const MachinesOverview = (): React.JSX.Element => {
    const { width, ref } = useElementSize();
    const { t, tns } = useNamespaceTranslation("pages", "client-home");
    const { machines, loading, error } = useMachineWebSocket("account");

    const navigate = useNavigate();

    const cols = round(width / 450);

    const stateSortMap: Record<MachineState, number> = {
        ERROR: 0,
        ACTIVE: 1,
        BOOTING_UP: 2,
        SHUTTING_DOWN: 3,
        LOADING: 4,
        OFFLINE: 5,
        FETCHING: 6,
    };

    const sortedMachines = values(machines).sort((a, b) => stateSortMap[a.state] - stateSortMap[b.state]);
    const shownMachines = sortedMachines.slice(0, cols);

    return (
        <Stack
            className={classes.overviewContainer}
            ref={ref}
        >
            <Group className={classes.overviewControls}>
                <Title
                    order={2}
                    c="white"
                >
                    {tns("machine-overview")}
                </Title>
                <Button
                    variant="white"
                    c="black"
                    rightSection={
                        <IconExternalLink
                            size={18}
                            stroke={3}
                        />
                    }
                    size="sm"
                    fw="600"
                    onClick={() => navigate("/admin/machines")}
                >
                    {tns("view-all")}
                </Button>
            </Group>
            <Paper className={classes.overviewPaper}>
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
            </Paper>
        </Stack>
    );
};

export default MachinesOverview;
