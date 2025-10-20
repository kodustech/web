"use client";

import { use, useEffect, useMemo, useState } from "react";
import useResizeObserver from "@hooks/use-resize-observer";
import { BaseUsageContract } from "@services/usage/types";
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
    data: Array<
        BaseUsageContract & {
            prNumber?: number;
            developer?: string;
            date?: string;
        }
    >;
    filterType: string;
}) => {
    const [graphRef, boundingRect] = useResizeObserver();
    const { isExpanded } = use(ExpandableContext);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getXAccessor = () => {
        switch (filterType) {
            case "daily":
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

    const transformedData = useMemo(() => {
        const merged: Record<string, any> = {};
        data.forEach((d) => {
            const key =
                filterType === "by-pr"
                    ? `#${d[xAccessor]}`
                    : String(d[xAccessor]);

            if (!merged[key]) {
                merged[key] = {
                    ...d,
                    [xAccessor]: key,
                    input: d.input || 0,
                    output: d.output || 0,
                    outputReasoning: d.outputReasoning || 0,
                };
            } else {
                merged[key].input += d.input || 0;
                merged[key].output += d.output || 0;
                merged[key].outputReasoning += d.outputReasoning || 0;
            }
        });

        return Object.values(merged);
    }, [data, filterType, xAccessor]);

    const isTiltedDate = transformedData?.length > 6 && !isExpanded;

    const getTickFormat = (x: any) => {
        if (filterType === "daily") {
            return new Date(x).toLocaleDateString();
        }
        return x;
    };

    const formatTicks = (t: number) => {
        if (t === 0) return "0";
        if (t < 1000) return t.toString();
        if (t < 1000000) return `${(t / 1000).toPrecision(3)}k`;
        return `${(t / 1000000).toPrecision(3)}M`;
    };

    if (!isMounted) {
        return <div ref={graphRef} className="h-full w-full" />;
    }

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
                <VictoryAxis dependentAxis tickFormat={formatTicks} />
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
                        data={transformedData.map((d) => ({
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
                        data={transformedData.map((d) => ({
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
                        data={transformedData.map((d) => ({
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
