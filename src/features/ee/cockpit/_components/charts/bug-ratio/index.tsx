import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryGroup,
    VictoryLabel,
    VictoryTheme,
} from "victory";

const formatAsPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
};

export const BugRatioChart = ({
    metricData,
}: {
    metricData: {
        chartDate: string;
        date: string;
        order: number;
        value: number;
    }[];
}) => {
    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ x: 40 }}
            width={1000}
            padding={{ left: 55, right: 10, top: 20, bottom: 25 }}>
            <VictoryAxis
                style={{
                    axis: { stroke: "#444" },
                    tickLabels: { fontSize: 10, fill: "white" },
                }}
            />

            <VictoryAxis
                dependentAxis
                tickValues={[0, 0.25, 0.5, 0.75, 1]}
                tickFormat={formatAsPercentage}
                style={{
                    axis: { stroke: "#444" },
                    ticks: { stroke: "#444" },
                    tickLabels: { fontSize: 10, fill: "white" },
                }}
            />

            <VictoryGroup
                offset={20}
                labelComponent={
                    <VictoryLabel style={{ fontSize: 10, fill: "#b7b7b7" }} />
                }
                style={{
                    data: { width: 50, fill: ({ datum }) => datum.fill },
                }}>
                <VictoryBar
                    labels={({ datum }) => formatAsPercentage(datum.y)}
                    data={metricData.map((d) => ({
                        x: d.chartDate,
                        y: d.value,
                        fill: "lime",
                    }))}
                />
            </VictoryGroup>
        </VictoryChart>
    );
};
