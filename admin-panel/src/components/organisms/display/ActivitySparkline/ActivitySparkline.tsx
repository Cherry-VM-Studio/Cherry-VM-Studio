import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MachineState } from "../../../../types/api.types";
import StateDivider from "../../../atoms/feedback/StateDivider/StateDivider";
import SparklineWithText from "../../../molecules/feedback/SparklineWithText/SparklineWithText";

const MAX_DATA_POINTS = 6;

/**
 * Inserts 50ies in the middle of data to make the chart lines look like they come out of the label.
 * Also one "100" entry is present to set the chart height to constant 100.
 * Otherwise, the chart range would be dynamic based on current max value and it wouldn't be centered vertically.
 */
const prepareData = (data: number[]): number[] => [...data?.slice(0, MAX_DATA_POINTS / 2), 50, 50, 100, 50, 50, ...data?.slice(MAX_DATA_POINTS / 2)];

/**
 * A component that displays CPU activity of a virtual machine using a Sparkline step graph.
 * When the machine is online, the graph shows the CPU activity with lines originating from the central label.
 * When the machine is offline, loading, or in a fetching state, the component shows a divider with a label
 * indicating the current status (e.g., 'OFFLINE', 'LOADING', or 'FETCHING').
 */
export default function ActivitySparkline({ currentState }: { currentState: MachineState }): React.ReactElement {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState<Array<number>>(Array.from({ length: MAX_DATA_POINTS }, () => 50));

    // update the chart data with new cpu state
    useEffect(() => {
        setChartData(prev => [...prev, currentState?.cpu || 0].slice(-MAX_DATA_POINTS));
    }, [currentState]);

    if (!currentState) return <StateDivider label="fetching" />;
    if (currentState.loading) return <StateDivider label="loading" />;
    if (!currentState.active) return <StateDivider label="offline" />;

    return (
        <SparklineWithText
            chartData={chartData}
            label={t("online")}
            curveType="step"
            color="suse-green.6"
        />
    );
}
