import { DotLoader } from "@components/ui/dot-loader";
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

interface IDeliveryCapacityLineChartProps {
    isLoading: boolean;
    metricData: {
        date: Date;
        chartDate: Date;
        deliveredItems: number;
        newItems: number;
        deliveryRate: number;
        order: number;
    }[];
}

export function DeliveryCapacityLineChart({
    metricData,
    isLoading,
}: IDeliveryCapacityLineChartProps) {
    if (isLoading) {
        return (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4">
                <DotLoader />
            </div>
        );
    }

    if (!metricData.length) return null;

    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            width={1000}
            domainPadding={{ x: 10 }}
            padding={{ left: 40, right: 30, top: 40, bottom: 60 }}>
            {[
                { accessor: "newItems", color: "orange" },
                { accessor: "deliveredItems", color: "violet" },
            ].map((item) => (
                <VictoryGroup
                    key={item.accessor}
                    labels={({ datum }) => datum.y}
                    labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
                    data={metricData.map((m) => ({
                        x: m.chartDate,
                        y: m[item.accessor as keyof typeof m],
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
                        labels={({ datum }) => Math.trunc(datum.y)}
                        style={{
                            data: { stroke: item.color },
                            labels: { fontSize: 10, fill: "white" },
                        }}
                    />

                    <VictoryScatter
                        size={3}
                        style={{
                            data: { fill: item.color },
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
                data={[
                    { name: "New items", symbol: { fill: "orange" } },
                    { name: "Delivered items", symbol: { fill: "violet" } },
                ]}
            />
        </VictoryChart>
    );
}
