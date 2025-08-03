"use client";

import { use } from "react";
import useResizeObserver from "@hooks/use-resize-observer";
import { ExpandableContext } from "src/core/providers/expandable";
import type { getLeadTimeForChange } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryContainer,
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
                    left: 45,
                    right: 10,
                    top: isTiltedDate ? 25 : 20,
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
                            angle: isTiltedDate && !isExpanded ? -25 : 0,
                            textAnchor:
                                isTiltedDate && !isExpanded ? "end" : "middle",
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
        </div>
    );
};
