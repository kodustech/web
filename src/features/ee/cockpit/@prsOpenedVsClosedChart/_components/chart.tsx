"use client";

import type { getPRsOpenedVsClosed } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryLegend,
    VictoryStack,
    VictoryTheme,
    VictoryTooltip,
} from "victory";

const [color1, color2] = ["lime", "tomato"] as const;

export const Chart = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getPRsOpenedVsClosed>>;
}) => {
    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ x: 30 }}
            padding={{ left: 35, right: 10, top: 0, bottom: 65 }}>
            <VictoryAxis
                style={{
                    axis: { stroke: "#444" },
                    tickLabels: {
                        fontSize: 10,
                        fill: "var(--color-text-primary)",
                        fontFamily: "var(--font-sans)",
                        padding: 2,
                        angle: ({ ticks }) => (ticks.length > 6 ? -25 : 0),
                        textAnchor: ({ ticks }) =>
                            ticks?.length > 6 ? "end" : "middle",
                    },
                }}
            />

            <VictoryAxis
                dependentAxis
                style={{
                    axis: { stroke: "#444" },
                    ticks: { stroke: "#444" },
                    tickLabels: {
                        fontSize: 10,
                        fill: "var(--color-text-primary)",
                    },
                }}
            />

            <VictoryLegend
                x={-10}
                y={274}
                borderComponent={<div />}
                style={{
                    labels: {
                        fontSize: 10,
                        fill: "var(--color-text-primary)",
                        fontFamily: "var(--font-sans)",
                    },
                }}
                data={[
                    {
                        name: "Opened",
                        symbol: { fill: color1 },
                    },
                    {
                        name: "Closed",
                        symbol: { fill: color2 },
                    },
                ]}
            />

            <VictoryStack
                labelComponent={
                    <VictoryTooltip
                        style={{
                            fontSize: 11,
                            fontFamily: "var(--font-sans)",
                            fontWeight: 700,
                        }}
                    />
                }
                style={{
                    data: { width: 20, fill: ({ datum }) => datum.fill },
                }}>
                <VictoryBar
                    labels={({ datum }) => ["Opened", datum.y]}
                    data={data?.map((item) => ({
                        x: item.weekStart,
                        y: item.openedCount,
                        fill: color1,
                    }))}
                />
                <VictoryBar
                    labels={({ datum }) => ["Closed", datum.y]}
                    data={data?.map((item) => ({
                        x: item.weekStart,
                        y: item.closedCount,
                        fill: color2,
                    }))}
                />
            </VictoryStack>
        </VictoryChart>
    );
};
