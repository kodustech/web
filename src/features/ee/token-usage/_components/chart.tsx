"use client";

import { use } from "react";
import useResizeObserver from "@hooks/use-resize-observer";
import { DailyUsageResultContract } from "@services/usage/types";
import { ExpandableContext } from "src/core/providers/expandable";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryContainer,
    VictoryLegend,
    VictoryStack,
    VictoryTheme,
    VictoryTooltip,
} from "victory";

const legendData = [
    { name: "Input", symbol: { fill: "#33c9dc" } },
    { name: "Output", symbol: { fill: "#f0b429" } },
    {
        name: "Output (Reasoning)",
        symbol: { fill: "#c43a31" },
    },
];

export const Chart = ({
    data,
    filterType,
}: {
    data: any[];
    filterType: string;
}) => {
    const [graphRef, boundingRect] = useResizeObserver();
    const { isExpanded } = use(ExpandableContext);
    const isTiltedDate = data?.length > 6 && !isExpanded;

    const getXAccessor = () => {
        switch (filterType) {
            case "daily":
            case "daily-by-pr":
            case "daily-by-developer":
                return "date";
            case "by-pr":
                return "prNumber";
            case "by-developer":
                return "developer";
            default:
                return "date";
        }
    };

    const xAccessor = getXAccessor();

    const getTickFormat = (x: any) => {
        if (
            ["daily", "daily-by-pr", "daily-by-developer"].includes(filterType)
        ) {
            return new Date(x).toLocaleDateString();
        }
        return x;
    };

    const getTickValues = () => {
        if (data.length <= 7) {
            return data.map((d) => d[xAccessor]);
        }

        // Show max 7 ticks
        const interval = Math.ceil(data.length / 7);
        return data
            .filter((_, index) => index % interval === 0)
            .map((d) => d[xAccessor]);
    };

    return (
        <div ref={graphRef} className="h-full w-full">
            <VictoryChart
                width={boundingRect.width}
                height={boundingRect.height}
                theme={VictoryTheme.material}
                domainPadding={{ x: 20 }}
                padding={{
                    left: 45,
                    right: 45,
                    top: isTiltedDate ? 25 : 20,
                    bottom: isTiltedDate ? 40 : 20,
                }}
                containerComponent={<VictoryContainer responsive={false} />}>
                <VictoryAxis
                    tickFormat={getTickFormat}
                    tickValues={getTickValues()}
                    style={{
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
                <VictoryAxis dependentAxis tickFormat={(t) => `${t / 1000}k`} />
                <VictoryLegend
                    x={boundingRect.width / 2 - 150}
                    y={-5}
                    orientation="horizontal"
                    gutter={20}
                    style={{
                        labels: {
                            fontSize: 12,
                            fill: "var(--color-text-primary)",
                        },
                    }}
                    data={legendData}
                />
                <VictoryStack
                    style={{
                        data: {
                            width: 20,
                        },
                    }}>
                    <VictoryBar
                        data={data.map((d) => ({
                            x: d[xAccessor],
                            y: d.input,
                        }))}
                        style={{
                            data: {
                                fill: legendData[0].symbol.fill,
                            },
                        }}
                        labels={({ datum }) => `Input: ${datum?.y}`}
                        labelComponent={<VictoryTooltip />}
                    />
                    <VictoryBar
                        data={data.map((d) => ({
                            x: d[xAccessor],
                            y: d.output,
                        }))}
                        style={{
                            data: {
                                fill: legendData[1].symbol.fill,
                            },
                        }}
                        labels={({ datum }) => `Output: ${datum?.y}`}
                        labelComponent={<VictoryTooltip />}
                    />
                    <VictoryBar
                        data={data.map((d) => ({
                            x: d[xAccessor],
                            y: d.outputReasoning,
                        }))}
                        style={{
                            data: {
                                fill: legendData[2].symbol.fill,
                            },
                        }}
                        labels={({ datum }) =>
                            `Output (Reasoning): ${datum?.y}`
                        }
                        labelComponent={<VictoryTooltip />}
                    />
                </VictoryStack>
            </VictoryChart>
        </div>
    );
};
