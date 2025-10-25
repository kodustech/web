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
    VictoryScatter,
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

    const { maxDomain, chartData } = useMemo(() => {
        const totals = transformedData.map((d) => 
            d.input + d.output + d.outputReasoning
        );
        
        if (totals.length === 0) {
            return { maxDomain: undefined, chartData: transformedData };
        }

        const sortedTotals = [...totals].sort((a, b) => a - b);
        const percentile95Index = Math.floor(sortedTotals.length * 0.95);
        const percentile95 = sortedTotals[percentile95Index];
        const maxValue = sortedTotals[sortedTotals.length - 1];

        if (maxValue > percentile95 * 3) {
            const capLimit = percentile95 * 1.2;
            
            const cappedData = transformedData.map((d) => {
                const total = d.input + d.output + d.outputReasoning;
                const isCapped = total > capLimit;
                
                if (isCapped) {
                    const ratio = capLimit / total;
                    return {
                        ...d,
                        isCapped: true,
                        originalInput: d.input,
                        originalOutput: d.output,
                        originalOutputReasoning: d.outputReasoning,
                        input: d.input * ratio,
                        output: d.output * ratio,
                        outputReasoning: d.outputReasoning * ratio,
                    };
                }
                
                return {
                    ...d,
                    isCapped: false,
                    originalInput: d.input,
                    originalOutput: d.output,
                    originalOutputReasoning: d.outputReasoning,
                };
            });

            return {
                maxDomain: capLimit,
                chartData: cappedData,
            };
        }

        return { maxDomain: undefined, chartData: transformedData };
    }, [transformedData]);

    const isTiltedDate = chartData?.length > 6 && !isExpanded;
    
    const minBarWidth = 40;
    const minWidth = chartData.length * minBarWidth;
    const chartWidth = Math.max(boundingRect.width, minWidth);
    const shouldScroll = chartWidth > boundingRect.width;

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
        <div ref={graphRef} className="h-full w-full flex flex-col">
            <div className={shouldScroll ? "overflow-x-auto pb-4" : ""} style={{ maxHeight: boundingRect.height }}>
                <VictoryChart
                    width={chartWidth}
                    height={shouldScroll ? boundingRect.height - 20 : boundingRect.height}
                    theme={VictoryTheme.material}
                    domainPadding={{ x: 20 }}
                    domain={maxDomain ? { y: [0, maxDomain] } : undefined}
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
                        data={chartData.map((d) => ({
                            x: d[xAccessor],
                            y: d.input,
                            isCapped: d.isCapped,
                            originalValue: d.originalInput,
                        }))}
                        style={{
                            data: {
                                fill: legendData[0].symbol.fill,
                            },
                        }}
                        labels={({ datum }) => 
                            datum?.isCapped 
                                ? `Input: ${formatTicks(datum?.originalValue)} (capped)`
                                : `Input: ${formatTicks(datum?.y)}`
                        }
                        labelComponent={<VictoryTooltip />}
                    />
                    <VictoryBar
                        data={chartData.map((d) => ({
                            x: d[xAccessor],
                            y: d.output,
                            isCapped: d.isCapped,
                            originalValue: d.originalOutput,
                        }))}
                        style={{
                            data: {
                                fill: legendData[1].symbol.fill,
                            },
                        }}
                        labels={({ datum }) => 
                            datum?.isCapped 
                                ? `Output: ${formatTicks(datum?.originalValue)} (capped)`
                                : `Output: ${formatTicks(datum?.y)}`
                        }
                        labelComponent={<VictoryTooltip />}
                    />
                    <VictoryBar
                        data={chartData.map((d) => ({
                            x: d[xAccessor],
                            y: d.outputReasoning,
                            isCapped: d.isCapped,
                            originalValue: d.originalOutputReasoning,
                        }))}
                        style={{
                            data: {
                                fill: legendData[2].symbol.fill,
                            },
                        }}
                        labels={({ datum }) =>
                            datum?.isCapped 
                                ? `Output (Reasoning): ${formatTicks(datum?.originalValue)} (capped)`
                                : `Output (Reasoning): ${formatTicks(datum?.y)}`
                        }
                        labelComponent={<VictoryTooltip />}
                    />
                </VictoryStack>
                {maxDomain && (
                    <VictoryScatter
                        data={chartData
                            .filter((d) => d.isCapped)
                            .map((d) => ({
                                x: d[xAccessor],
                                y: maxDomain * 0.98,
                            }))}
                        size={4}
                        style={{
                            data: {
                                fill: "#ff9800",
                                stroke: "#fff",
                                strokeWidth: 1,
                            },
                        }}
                        labels={() => "Value exceeds scale"}
                        labelComponent={<VictoryTooltip />}
                    />
                )}
            </VictoryChart>
            </div>
            {maxDomain && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-2 px-2">
                    ⚠ Some values exceed the scale and are capped for better
                    visualization. Hover over bars to see actual values.
                </div>
            )}
        </div>
    );
};
