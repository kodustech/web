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
    return (
        <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ x: 30 }}
            padding={{ left: 40, right: 20, top: 20, bottom: 40 }}>
            <VictoryAxis
                style={{
                    axis: { stroke: "#444" },
                    tickLabels: {
                        fontSize: 10,
                        fill: "white",
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
                    tickLabels: { fontSize: 10, fill: "white" },
                }}
            />

            <VictoryStack
                labelComponent={
                    <VictoryTooltip style={{ fontSize: 11, fill: "black" }} />
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
                                item.author,
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
