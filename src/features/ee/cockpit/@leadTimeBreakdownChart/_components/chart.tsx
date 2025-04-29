"use client";

import type { getLeadTimeBreakdown } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryLegend,
    VictoryStack,
    VictoryTheme,
    VictoryTooltip,
} from "victory";

const [color1, color2, color3] = ["tomato", "orange", "lime"] as const;

const separateHoursAndMinutes = (hours: number) => {
    const a = Math.trunc(hours);
    const b = Math.trunc(60 * (hours - a));
    return { hours: a, minutes: b };
};

export const Chart = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getLeadTimeBreakdown>>;
}) => {
    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ x: 30 }}
            padding={{ left: 45, right: 20, top: 0, bottom: 70 }}>
            <VictoryAxis
                style={{
                    axis: { stroke: "#444" },
                    tickLabels: {
                        fontSize: 10,
                        padding: 2,
                        fill: "var(--color-text-primary)",
                        fontFamily: "var(--font-sans)",
                        angle: ({ ticks }) => (ticks.length > 6 ? -25 : 0),
                        textAnchor: ({ ticks }) =>
                            ticks?.length > 6 ? "end" : "middle",
                    },
                }}
            />

            <VictoryAxis
                dependentAxis
                tickFormat={(tick) => `${tick} h`}
                style={{
                    axis: { stroke: "#444" },
                    tickLabels: {
                        fontSize: 10,
                        fill: "var(--color-text-primary)",
                        fontFamily: "var(--font-sans)",
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
                        name: "Coding Time",
                        symbol: { fill: color1 },
                    },
                    {
                        name: "Pickup Time",
                        symbol: { fill: color2 },
                    },
                    {
                        name: "Review Time",
                        symbol: { fill: color3 },
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
                    data: {
                        width: 20,
                        fill: ({ datum }) => datum.fill,
                    },
                }}>
                <VictoryBar
                    labels={({ datum }) => {
                        const { hours, minutes } = separateHoursAndMinutes(
                            datum.y,
                        );

                        return ["Coding time", `${hours}h ${minutes}m`];
                    }}
                    data={data?.map((item) => ({
                        x: item.weekStart,
                        y: item.codingTimeHours,
                        fill: color1,
                    }))}
                />
                <VictoryBar
                    labels={({ datum }) => {
                        const { hours, minutes } = separateHoursAndMinutes(
                            datum.y,
                        );

                        return ["Pickup time", `${hours}h ${minutes}m`];
                    }}
                    data={data?.map((item) => ({
                        x: item.weekStart,
                        y: item.pickupTimeHours,
                        fill: color2,
                    }))}
                />
                <VictoryBar
                    labels={({ datum }) => {
                        const { hours, minutes } = separateHoursAndMinutes(
                            datum.y,
                        );

                        return ["Review time", `${hours}h ${minutes}m`];
                    }}
                    data={data?.map((item) => ({
                        x: item.weekStart,
                        y: item.reviewTimeHours,
                        fill: color3,
                    }))}
                />
            </VictoryStack>
        </VictoryChart>
    );
};
