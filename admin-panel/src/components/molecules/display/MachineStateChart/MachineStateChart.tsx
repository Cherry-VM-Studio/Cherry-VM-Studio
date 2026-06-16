import { Group, SegmentedControl, Stack } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { useEffect, useState } from "react";
import { getCurrentTime } from "../../../../utils/misc";
import { useTranslation } from "react-i18next";
import { Machine, MachineState } from "../../../../types/api.types";
import { MachineStateChartData } from "../../../../types/components.types";

const getLabel = (resource: string, t: Function) => (t ? t("machine.graph.resource-used", { resource: resource, ns: "pages" }) : null);

const getChartProps = (machine: Machine | undefined, t: Function) =>
    machine
        ? {
              RAM: {
                  yAxisProps: { domain: [0, machine.ram_max || 1024], tickCount: 12, width: 80 },
                  series: [{ name: "ram_used", color: "teal.6", label: getLabel("RAM", t) }],
                  unit: " MB",
              },
          }
        : {};

const TIME_PERIODS = [
    { label: "10s", value: "10" },
    { label: "30s", value: "30" },
    { label: "1min", value: "60" },
    { label: "5min", value: "300" },
];

const MAX_KEEP_TIME = parseInt(TIME_PERIODS[TIME_PERIODS.length - 1].value);

export interface MachineStateChartProps {
    machine: Machine;
}

const MachineStateChart = ({ machine }: MachineStateChartProps) => {
    const { t } = useTranslation();
    const [chosenChart, setChosenChart] = useState<string>("RAM");
    const [timePeriod, setTimePeriod] = useState<string>("30");
    const [chartData, setChartData] = useState<Array<MachineStateChartData | object>>(new Array(MAX_KEEP_TIME).fill({}));

    useEffect(() => {
        const time = getCurrentTime();
        const newChartData: MachineStateChartData = (({ ram_used, ram_max }) => ({ ram_used, ram_max }))(machine);

        setChartData((pastData) => [...pastData, { time: time, ...newChartData }].slice(-MAX_KEEP_TIME));
    }, [machine]);

    return (
        <Stack
            justify="flex-end"
            align="flex-start"
            gap="xl"
            h="100%"
        >
            <Group
                justify="space-between"
                w="100%"
            >
                <SegmentedControl
                    size="md"
                    data={Object.keys(getChartProps(machine, t))}
                    onChange={setChosenChart}
                    value={chosenChart}
                />
                <SegmentedControl
                    size="md"
                    data={TIME_PERIODS}
                    onChange={setTimePeriod}
                    withItemsBorders={false}
                    defaultValue={"30"}
                />
            </Group>
            <AreaChart
                flex="1"
                data={chartData.slice(-parseInt(timePeriod) - 1)}
                dataKey="time"
                tickLine="x"
                curveType="linear"
                {...getChartProps(machine, t)?.[chosenChart]}
                xAxisProps={{ minTickGap: 50 }}
            />
        </Stack>
    );
};

export default MachineStateChart;
