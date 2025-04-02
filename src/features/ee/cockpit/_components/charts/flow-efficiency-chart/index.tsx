import { useMemo } from "react";
import seedColor from "seed-color";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryLegend,
    VictoryStack,
    VictoryTheme,
    VictoryTooltip,
} from "victory";

interface IFlowEfficiencyValue {
    days: number;
    percentage: number;
}

interface IFlowEfficiencyMetric {
    date: string;
    chartDate: string;
    value: {
        [key: string]: IFlowEfficiencyValue;
    };
    waitingTime: {
        days: number;
        percentage: number;
    };
    actionTime: {
        days: number;
        percentage: number;
    };
    order: number;
}

interface FlowEfficiencyChartProps {
    metricData: IFlowEfficiencyMetric[];
}

const transformMetricData = (metricData: IFlowEfficiencyMetric[]) => {
    const seenDates = new Set<string>();
    return metricData.reduce(
        (acc, metric) => {
            if (seenDates.has(metric.chartDate)) return acc;
            seenDates.add(metric.chartDate);
            const { value, ...metricRest } = metric;
            const entries = Object.entries(value);
            for (let i = 0; i < entries.length; i++) {
                const [type, item] = entries[i];
                acc.push({ ...metricRest, type, item });
            }
            return acc;
        },
        [] as Array<{
            date: string;
            chartDate: string;
            waitingTime: {
                days: number;
                percentage: number;
            };
            actionTime: {
                days: number;
                percentage: number;
            };
            order: number;
            item: IFlowEfficiencyValue;
            type: string;
        }>,
    );
};

export function FlowEfficiencyChart({ metricData }: FlowEfficiencyChartProps) {
    const data = transformMetricData(metricData);

    const dataCategories = useMemo(
        () => [...new Set(data.map((c) => c.type))],
        [data],
    );

    if (!data.length) return null;

    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ x: 40 }}
            width={1000}
            height={400}
            padding={{ left: 40, right: 10, top: 50, bottom: 80 }}>
            <VictoryAxis
                style={{
                    axis: { stroke: "#444" },
                    tickLabels: { fontSize: 10, fill: "white" },
                }}
            />

            <VictoryAxis
                dependentAxis
                tickValues={[0, 25, 50, 75, 100]}
                tickFormat={(t) => `${t}%`}
                style={{
                    axis: { stroke: "#444" },
                    ticks: { stroke: "#444" },
                    tickLabels: { fontSize: 10, fill: "white" },
                }}
            />

            <VictoryLegend
                x={-10}
                y={350}
                itemsPerRow={6}
                borderComponent={<div />}
                style={{
                    labels: { fontSize: 10, fill: "white" },
                }}
                data={
                    dataCategories.map((c) => ({
                        name: c,
                        symbol: { fill: seedColor(c).toHex() },
                    })) as { name: string; symbol: { fill: string } }[]
                }
            />

            <VictoryStack
                labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
                style={{
                    data: { width: 50, fill: ({ datum }) => datum.fill },
                }}>
                {data.map((d) => (
                    <VictoryBar
                        key={d.type}
                        labels={({ datum }) => [
                            `${d.type}: ${datum.y}%`,
                            "----------------------------",
                            `Waiting Time: ${d.waitingTime.percentage}%`,
                            `Action Time: ${d.actionTime.percentage}%`,
                        ]}
                        data={[
                            {
                                x: d.chartDate,
                                y: d.item.percentage,
                                fill: seedColor(d.type).toHex(),
                            },
                        ]}
                    />
                ))}
            </VictoryStack>
        </VictoryChart>
    );
}
