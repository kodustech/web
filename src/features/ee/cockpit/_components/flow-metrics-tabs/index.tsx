"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
    Metric,
    NewItemsFrom,
    TeamExclusiveMetrics,
} from "@services/metrics/types";
import { Team } from "@services/teams/types";
import { ArrowBigDownDash, ArrowBigUpDash, Ban, Minus } from "lucide-react";
import { cn } from "src/core/utils/components";

import { BarChart } from "../charts/bar-chart";
import { BugRatioChart } from "../charts/bug-ratio";
import { DeliveryCapacityLineChart } from "../charts/delivery-capacity-chart";
import { FlowEfficiencyChart } from "../charts/flow-efficiency-chart";
import { LeadTimeInWipByItemTypeChart } from "../charts/lead-time-in-wip-by-item-type-chart";
import { LineChart } from "../charts/line-chart";
import { ThroughputChart } from "../charts/throughput-chart";
import { DeliveryCapacityFilter } from "./components/deliveryCapacityFilter";

type ChartComponent = () => React.JSX.Element;

export default function FlowMetricsTabs({
    selectedTeam,
    selectedDateRange,
    flowMetrics,
}: {
    selectedTeam: Team;
    selectedDateRange: { startDate: string; endDate: string };
    flowMetrics: Metric[];
}) {
    const [chartsData, setChartsData] = useState<any>([]);
    const [isChartLoading, setIsChartLoading] = useState(true);

    const dateRange = {
        from: new Date(selectedDateRange.startDate),
        to: new Date(selectedDateRange.endDate),
    };

    const [newItemsFrom, setNewItemsFrom] = useState<NewItemsFrom>(
        NewItemsFrom.TODO_COLUMN,
    );

    const handleFilterDeliverCapacityMetric = async (value: NewItemsFrom) => {
        setNewItemsFrom(value);

        await fetchChartData(
            selectedTeam,
            dateRange?.from?.toString(),
            dateRange?.to?.toString(),
            value,
        );
    };

    const fetchChartData = async (
        team: Team,
        startDate?: string,
        endDate?: string,
        newItemsFrom?: string,
    ) => {
        setIsChartLoading(true);
        setChartsData([]);
        setIsChartLoading(false);
    };

    useEffect(() => {
        fetchChartData(
            selectedTeam,
            dateRange?.from?.toString(),
            dateRange?.to?.toString(),
        );
    }, [selectedTeam]);

    const renderDifference = (difference: string, resultType: string) => {
        if (!difference) {
            return (
                <div className="flex items-center gap-0.5 text-xs">
                    <Ban className="size-5" />
                    <span>No prior data available.</span>
                </div>
            );
        }

        if (resultType === "Same") {
            return (
                <div className="flex items-center gap-0.5 text-xs">
                    <Minus className="size-5" />
                    <span>Unchanged</span>
                </div>
            );
        }

        if (resultType === "Negative") {
            return (
                <div className="flex items-center gap-0.5 text-xs">
                    <ArrowBigDownDash className="text-primary-light size-5" />
                    <span>{difference}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-0.5 text-xs">
                <ArrowBigUpDash className="text-success size-5" />
                <span>{difference}</span>
            </div>
        );
    };

    const getChartDataForMetric = (name: string) => {
        if (!name) return;

        const metricDataKey = Object.keys(chartsData).find((key) =>
            key.toLowerCase().includes(name.toLowerCase()),
        );
        return metricDataKey ? chartsData[metricDataKey] || [] : [];
    };

    const renderTeamChart = (metricName: string) => {
        const chartComponents: Record<string, ChartComponent> = {
            [TeamExclusiveMetrics.FLOW_EFFICIENCY]: () => (
                <FlowEfficiencyChart
                    metricData={getChartDataForMetric(metricName)}
                />
            ),
            [TeamExclusiveMetrics.DELIVERY_CAPACITY]: () => (
                <div className="flex flex-col gap-4">
                    <DeliveryCapacityFilter
                        newItemsFrom={newItemsFrom}
                        handleFilterDeliverCapacityMetric={
                            handleFilterDeliverCapacityMetric
                        }
                    />
                    <DeliveryCapacityLineChart
                        isLoading={isChartLoading}
                        metricData={getChartDataForMetric(metricName)}
                    />
                </div>
            ),
            throughput: () => (
                <ThroughputChart
                    metricData={getChartDataForMetric(metricName)}
                />
            ),
            leadTimeInWip: () => (
                <LeadTimeInWipByItemTypeChart
                    isLoading={isChartLoading}
                    metricData={getChartDataForMetric(
                        "leadTimeInWipByItemType",
                    )}
                />
            ),
            bugRatio: () => (
                <BugRatioChart metricData={getChartDataForMetric(metricName)} />
            ),
        };
        return (
            chartComponents[metricName]?.() || (
                <BarChart
                    metricData={getChartDataForMetric(metricName)}
                    metricName={metricName}
                />
            )
        );
    };

    const renderChart = (metricName: string, selectedTeam: any) => {
        return selectedTeam ? (
            renderTeamChart(metricName)
        ) : (
            <LineChart
                metricData={getChartDataForMetric(metricName)}
                metricName={metricName}
            />
        );
    };

    return (
        <Tabs
            defaultValue={
                flowMetrics?.sort((a, b) => a.layoutIndex - b.layoutIndex)[0]
                    ?.title || ""
            }>
            <TabsList className="flex overflow-x-auto">
                {flowMetrics?.length === 0 || !flowMetrics
                    ? null
                    : flowMetrics
                          ?.filter((metric) => metric?.name !== "leadTime")
                          ?.sort((a, b) => a?.layoutIndex - b?.layoutIndex)
                          ?.map((metric, index) => (
                              <TabsTrigger
                                  key={index}
                                  value={metric.title}
                                  className="flex w-60 flex-col justify-between gap-6 rounded-t-xl border border-b-0 bg-[#14121799] px-5 py-4 data-[state=active]:bg-[#362c45ff]">
                                  <div className="flex w-full flex-col items-start">
                                      <span className="line-clamp-2 flex-1 text-start text-xs leading-tight">
                                          {metric.title}
                                      </span>

                                      <div
                                          className={cn(
                                              buttonVariants({
                                                  variant: "helper",
                                              }),
                                              "pointer-events-none mt-2 h-6 px-2",
                                          )}>
                                          {renderDifference(
                                              metric.difference,
                                              metric.resultType,
                                          )}
                                      </div>
                                  </div>

                                  <div className="flex flex-col items-start gap-1">
                                      <Heading
                                          variant="h2"
                                          className="leading-none">
                                          {metric.result}
                                      </Heading>

                                      <span className="text-text-secondary text-start text-xs">
                                          {metric.resultObs}
                                      </span>
                                  </div>
                              </TabsTrigger>
                          ))}
            </TabsList>

            {flowMetrics?.length === 0
                ? null
                : flowMetrics
                      ?.filter((metric) => metric?.name !== "leadTime")
                      ?.sort((a, b) => a?.layoutIndex - b?.layoutIndex)
                      ?.map((metric, index) => (
                          <TabsContent
                              key={index}
                              value={metric?.title}
                              asChild
                              className="rounded-t-none">
                              <Card>
                                  <CardHeader>
                                      {metric?.result ? (
                                          <div>
                                              {renderChart(
                                                  metric?.name,
                                                  selectedTeam,
                                              )}
                                          </div>
                                      ) : (
                                          <div>Metric not found.</div>
                                      )}
                                  </CardHeader>
                              </Card>
                          </TabsContent>
                      ))}
        </Tabs>
    );
}
