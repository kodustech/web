"use client";

import type { getLeadTimeForChange } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryGroup,
    VictoryLabel,
    VictoryTheme,
} from "victory";

const [color1] = ["lime"] as const;

const separateHoursAndMinutes = (hours: number) => {
    const a = Math.trunc(hours);
    const b = Math.trunc(60 * (hours - a));
    return { hours: a, minutes: b };
};

export const Chart = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getLeadTimeForChange>>;
}) => {
    return (
        <VictoryChart
            domainPadding={{ x: 30 }}
            theme={VictoryTheme.clean}
            padding={{ left: 45, right: 10, top: 15, bottom: 10 }}>
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
                tickFormat={(tick) => `${tick} h`}
                style={{
                    axis: { stroke: "#444" },
                    ticks: { stroke: "#444" },
                    tickLabels: {
                        fontSize: 10,
                        fill: "var(--color-text-primary)",
                        fontFamily: "var(--font-sans)",
                    },
                }}
            />

            <VictoryGroup
                labelComponent={
                    <VictoryLabel
                        style={{
                            fontSize: 11,
                            fill: "var(--color-text-secondary)",
                            fontFamily: "var(--font-sans)",
                        }}
                    />
                }
                style={{
                    data: { width: 25, fill: ({ datum }) => datum.fill },
                }}>
                <VictoryBar
                    labels={({ datum }) => {
                        const { hours, minutes } = separateHoursAndMinutes(
                            datum.y,
                        );

                        return `${hours}h ${minutes}m`;
                    }}
                    data={data?.map((item) => ({
                        x: item.weekStart,
                        y: item.leadTimeP75Hours,
                        fill: color1,
                    }))}
                />
            </VictoryGroup>
        </VictoryChart>
    );
};
