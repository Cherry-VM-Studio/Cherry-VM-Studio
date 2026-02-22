import { Button, Group, Paper, Stack, Title } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import useFetch from "../../../../hooks/useFetch";
import { isNull, keys } from "lodash";
import { useNavigate } from "react-router-dom";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { ERRORS } from "../../../../config/errors.config";
import classes from "./MachinesOverview.module.css";
import { IconExternalLink } from "@tabler/icons-react";
import MachinesGrid from "../../../molecules/display/MachinesGrid/MachinesGrid";
import useMachineWebSocket from "../../../../hooks/useMachineWebSocket";

const MachinesOverview = (): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "client-home");

    const navigate = useNavigate();

    const { machines } = useMachineWebSocket("account");

    return (
        <Stack className={classes.overviewContainer}>
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
                <MachinesGrid
                    machines={machines}
                    error={null}
                    loading={isNull(machines)}
                    rows={1}
                />
            </Paper>
        </Stack>
    );
};

export default MachinesOverview;
