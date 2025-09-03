"use client";

import { use } from "react";
import useResizeObserver from "@hooks/use-resize-observer";
import colorSeed from "seed-color";
import { ExpandableContext } from "src/core/providers/expandable";
import type { AwaitedReturnType } from "src/core/types";
import { pluralize } from "src/core/utils/string";
import type { getPRsByDeveloper } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryContainer,
    VictoryStack,
    VictoryTheme,
    VictoryTooltip,
} from "victory";

export const Chart = ({
    data,
}: {
    data: AwaitedReturnType<typeof getPRsByDeveloper>;
}) => {
    const [graphRef, boundingRect] = useResizeObserver();
    const { isExpanded } = use(ExpandableContext);
    const isTiltedDate = data?.length > 6 && !isExpanded;

    return (
        <div ref={graphRef} className="h-full w-full">
            <VictoryChart
                domainPadding={{ x: 30 }}
                theme={VictoryTheme.clean}
                width={boundingRect.width}
                height={boundingRect.height}
                padding={{
                    left: 40,
                    right: 10,
                    top: 10,
                    bottom: isTiltedDate ? 40 : 20,
                }}
                containerComponent={
                    <VictoryContainer
                        responsive={false}
                        height={boundingRect.height}
                    />
                }>
                <VictoryAxis
                    style={{
                        axis: { stroke: "#444" },
                        tickLabels: {
                            fontSize: 10,
                            fill: "var(--color-text-primary)",
                            fontFamily: "var(--font-sans)",
                            padding: 2,
                            angle: isTiltedDate ? -25 : 0,
                            textAnchor: isTiltedDate ? "end" : "middle",
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
        </div>
    );
};
