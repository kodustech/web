import { useMemo } from "react";
import { Spinner } from "@components/ui/spinner";
import seedColor from "seed-color";
import {
    VictoryAxis,
    VictoryChart,
    VictoryGroup,
    VictoryLegend,
    VictoryLine,
    VictoryScatter,
    VictoryTheme,
    VictoryTooltip,
    VictoryVoronoiContainer,
} from "victory";

interface ILeadTimeInWipItem {
    workItemType: string;
    hours: number;
    days: number;
}

interface ILeadTimeInWipByItemType {
    date: string;
    chartDate: string;
    result: ILeadTimeInWipItem[];
    order: number;
}

interface ILeadTimeInWipByItemTypeChartProps {
    metricData: ILeadTimeInWipByItemType[];
    isLoading: boolean;
}

export function LeadTimeInWipByItemTypeChart({
    metricData,
    isLoading,
}: ILeadTimeInWipByItemTypeChartProps) {
    const data = metricData.reduce(
        (acc, metric) => {
            const { result, ...metricRest } = metric;
            if (acc.find((a) => a.chartDate === metric.chartDate)) return acc;
            for (const item of result) acc.push({ ...metricRest, item });
            return acc;
        },
        [] as Array<{
            date: string;
            chartDate: string;
            order: number;
            item: ILeadTimeInWipItem;
        }>,
    );

    const dataCategories = useMemo(
        () => [...new Set(data.map((c) => c.item.workItemType))],
        [data],
    );

    const dataGroupedByCategory = data.reduce(
        (acc, metric) => {
            const { item, ...metricRest } = metric;
            const { workItemType } = item;
            const category = acc.find((a) => a.workItemType === workItemType);

            if (!category) {
                acc.push({
                    ...metricRest,
                    workItemType,
                    dates: [{ ...item, date: metric.chartDate }],
                });
            } else {
                category.dates.push({ ...item, date: metric.chartDate });
            }

            return acc;
        },
        [] as Array<{
            dates: Array<{ hours: number; days: number; date: string }>;
            workItemType: string;
        }>,
    );

    if (isLoading) {
        return (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4">
                <Spinner />
            </div>
        );
    }

    if (!metricData?.length) return null;

    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            width={1000}
            domainPadding={{ x: 10 }}
            padding={{ left: 40, right: 30, top: 30, bottom: 60 }}>
            {dataGroupedByCategory.map((c) => (
                <VictoryGroup
                    key={c.workItemType}
                    labels={({ datum }) => [c.workItemType, `${datum.y} days`]}
                    labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
                    data={c.dates.map((d) => ({
                        x: d.date,
                        y: d.days,
                    }))}
                    dataComponent={
                        <VictoryVoronoiContainer
                            voronoiDimension="x"
                            labels={({ datum }) => datum.y}
                            labelComponent={
                                <VictoryTooltip style={{ fontSize: 10 }} />
                            }
                        />
                    }>
                    <VictoryLine
                        style={{
                            labels: { fontSize: 10, fill: "white" },
                            data: {
                                stroke: seedColor(c.workItemType).toHex(),
                            },
                        }}
                    />

                    <VictoryScatter
                        size={3}
                        style={{
                            data: {
                                fill: seedColor(c.workItemType).toHex(),
                            },
                        }}
                    />
                </VictoryGroup>
            ))}

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
                y={270}
                borderComponent={<div />}
                style={{
                    labels: { fontSize: 10, fill: "white" },
                }}
                data={dataCategories.map((c) => ({
                    name: c,
                    symbol: { fill: seedColor(c).toHex() },
                }))}
            />
        </VictoryChart>
    );
}
