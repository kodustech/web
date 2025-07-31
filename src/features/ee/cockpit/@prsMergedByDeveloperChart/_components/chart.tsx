"use client";

import colorSeed from "seed-color";
import { pluralize } from "src/core/utils/string";
import type { getPRsByDeveloper } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryStack,
    VictoryTheme,
    VictoryTooltip,
} from "victory";

export const Chart = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getPRsByDeveloper>>;
}) => {
    const isTiltedDate = data.length > 6;

    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ x: 30 }}
            padding={{
                left: 40,
                right: 10,
                top: 0,
                bottom: isTiltedDate ? 30 : 10,
            }}>
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
                        fontFamily: "var(--font-sans)",
                    },
                }}
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
                {data?.map((item) => {
                    const color = colorSeed(item.author).toHex();

                    return (
                        <VictoryBar
                            key={item.weekStart}
                            labels={({ datum }) => [
                                String(item.author),
                                `${datum.y} ${pluralize(datum.y, {
                                    singular: "PR",
                                    plural: "PRs",
                                })}`,
                            ]}
                            data={[
                                {
                                    x: item.weekStart,
                                    y: item.prCount,
                                    fill: color,
                                },
                            ]}
                        />
                    );
                })}
            </VictoryStack>
        </VictoryChart>
    );
};
