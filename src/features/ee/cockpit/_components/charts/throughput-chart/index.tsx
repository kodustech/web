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

interface IThroughputChartProps {
    metricData: Array<{
        date: string;
        value: number;
        completeResult: Array<{
            value: number;
            workItemTypeId: string;
            workItemTypeName: string;
            percentageOfTotal: number;
        }>;
    }>;
}

export function ThroughputChart({ metricData }: IThroughputChartProps) {
    const chartData = useMemo(
        () =>
            metricData.reduce(
                (acc, metric) => {
                    const { completeResult, ...metricRest } = metric;

                    for (const element of completeResult) {
                        acc.push({ ...metricRest, item: element });
                    }

                    return acc;
                },
                [] as Array<{
                    date: string;
                    value: number;
                    item: {
                        value: number;
                        workItemTypeName: string;
                        percentageOfTotal: number;
                    };
                }>,
            ),
        [metricData],
    );

    const dataCategories = useMemo(
        () => [...new Set(chartData.map((c) => c.item.workItemTypeName))],
        [chartData],
    );

    return (
        <>
            <VictoryChart
                theme={VictoryTheme.clean}
                domainPadding={{ x: 80 }}
                width={1000}
                padding={{ left: 35, right: 10, top: 30, bottom: 60 }}>
                <VictoryAxis
                    style={{
                        axis: { stroke: "#444" },
                        tickLabels: { fontSize: 10, fill: "white" },
                    }}
                />

                <VictoryAxis
                    dependentAxis
                    style={{
                        axis: { stroke: "#444" },
                        ticks: { stroke: "#444" },
                        tickLabels: { fontSize: 10, fill: "white" },
                    }}
                />

                <VictoryLegend
                    x={-10}
                    y={274}
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
                        data: { fill: ({ datum }) => datum.fill },
                    }}>
                    {chartData.map((c) => (
                        <VictoryBar
                            key={c.date}
                            labels={({ datum }) => [
                                c.item.workItemTypeName,
                                `${datum.y} (${c.item.percentageOfTotal}%)`,
                            ]}
                            data={[
                                {
                                    x: c.date,
                                    y: c.item.value,
                                    fill: seedColor(
                                        c.item.workItemTypeName,
                                    ).toHex(),
                                },
                            ]}
                        />
                    ))}
                </VictoryStack>
            </VictoryChart>
        </>
    );
}
