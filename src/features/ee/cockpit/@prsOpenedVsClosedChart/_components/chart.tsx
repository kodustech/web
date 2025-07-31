"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { cn } from "src/core/utils/components";
import type { getPRsOpenedVsClosed } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryStack,
    VictoryTheme,
    VictoryTooltip,
} from "victory";

const [color1, color2] = ["lime", "tomato"] as const;

const legendItems = [
    {
        name: "Opened",
        fill: color1,
    },
    {
        name: "Closed",
        fill: color2,
    },
] as const;

export const Chart = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getPRsOpenedVsClosed>>;
}) => {
    const [visibleBars, setVisibleBars] = useState(
        legendItems.reduce(
            (acc, item) => {
                acc[item.name] = true;
                return acc;
            },
            {} as Record<(typeof legendItems)[number]["name"], boolean>,
        ),
    );

    const isTiltedDate = data.length > 6;

    return (
        <div className="flex flex-1 flex-col gap-4">
            <VictoryChart
                theme={VictoryTheme.clean}
                domainPadding={{ x: 30 }}
                padding={{
                    left: 45,
                    right: 10,
                    top: 10,
                    bottom: isTiltedDate ? 45 : 30,
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
                    {visibleBars["Opened"] && (
                        <VictoryBar
                            labels={({ datum }) => ["Opened", datum.y]}
                            data={data?.map((item) => ({
                                x: item.weekStart,
                                y: item.openedCount,
                                fill: color1,
                            }))}
                        />
                    )}

                    {visibleBars["Closed"] && (
                        <VictoryBar
                            labels={({ datum }) => ["Closed", datum.y]}
                            data={data?.map((item) => ({
                                x: item.weekStart,
                                y: item.closedCount,
                                fill: color2,
                            }))}
                        />
                    )}
                </VictoryStack>
            </VictoryChart>

            <div className="flex items-center gap-5">
                {legendItems.map((item) => (
                    <Button
                        size="xs"
                        key={item.name}
                        variant="cancel"
                        className="flex min-h-auto cursor-pointer items-center gap-2 rounded-none p-0 text-xs"
                        active={visibleBars[item.name]}
                        onClick={() => {
                            setVisibleBars((prev) => {
                                const nextValue = {
                                    ...prev,
                                    [item.name]: !prev[item.name],
                                };

                                if (Object.values(nextValue).every((v) => !v))
                                    return prev;

                                return nextValue;
                            });
                        }}>
                        <span
                            style={{ backgroundColor: item.fill }}
                            className={cn(
                                "size-3 rounded-full",
                                !visibleBars[item.name] && "bg-text-tertiary!",
                            )}
                        />
                        {item.name}
                    </Button>
                ))}
            </div>
        </div>
    );
};
