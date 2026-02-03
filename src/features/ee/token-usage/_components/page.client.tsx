"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@components/ui/card";
import { BaseUsageContract, ModelPricingInfo } from "@services/usage/types";
import { DateRangePicker } from "src/features/ee/cockpit/_components/date-range-picker";

import { useTokenUsageFilters } from "../_hooks/filter.hook";
import { Chart } from "./chart";
import { CostCards } from "./cost-cards";
import { Filters } from "./filters";
import { NoData } from "./no-data";
import { SummaryCards } from "./summary-cards";

const calculateCost = (
    model: ModelPricingInfo,
    inputTokens: number,
    outputTokens: number,
    outputReasoningTokens: number,
) => {
    if (!model || !model.pricing) {
        return {
            inputCost: 0,
            outputCost: 0,
            outputReasoningCost: 0,
            totalCost: 0,
        };
    }

    const inputCost = model.pricing.prompt * (inputTokens ?? 0);
    const outputCost = model.pricing.completion * (outputTokens ?? 0);
    const outputReasoningCost =
        model.pricing.internal_reasoning * (outputReasoningTokens ?? 0);
    const totalCost = inputCost + outputCost + outputReasoningCost;

    return {
        inputCost,
        outputCost,
        outputReasoningCost,
        totalCost,
    };
};

export const TokenUsagePageClient = ({
    data,
    cookieValue,
    models,
    pricing,
}: {
    data: BaseUsageContract[];
    cookieValue: string | undefined;
    models: string[];
    pricing: Record<string, ModelPricingInfo>;
}) => {
    const [isMounted, setIsMounted] = useState(false);

    const filters = useTokenUsageFilters(models);
    const { selectedModels, currentFilter } = filters;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((d) => selectedModels.includes(d.model));
    }, [data, selectedModels]);

    const totalUsage = useMemo(() => {
        if (!filteredData) {
            return {
                input: 0,
                output: 0,
                total: 0,
                outputReasoning: 0,
                inputCost: 0,
                outputCost: 0,
                outputReasoningCost: 0,
                totalCost: 0,
                usageByModel: {},
                costByModel: {},
            };
        }

        const usageByModel: Record<
            string,
            {
                input: number;
                output: number;
                total: number;
                outputReasoning: number;
            }
        > = {};

        selectedModels.forEach((model) => {
            usageByModel[model] = {
                input: 0,
                output: 0,
                total: 0,
                outputReasoning: 0,
            };
        });

        filteredData.forEach((day) => {
            if (usageByModel[day.model]) {
                usageByModel[day.model].input += day?.input ?? 0;
                usageByModel[day.model].output += day?.output ?? 0;
                usageByModel[day.model].total += day?.total ?? 0;
                usageByModel[day.model].outputReasoning +=
                    day?.outputReasoning ?? 0;
            }
        });

        let totalInput = 0;
        let totalOutput = 0;
        let totalTokens = 0;
        let totalOutputReasoning = 0;
        let totalCostAllModels = 0;

        for (const model of selectedModels) {
            const modelUsage = usageByModel[model];
            const modelPricing = pricing[model];
            if (modelUsage && modelPricing) {
                const cost = calculateCost(
                    modelPricing,
                    modelUsage.input,
                    modelUsage.output,
                    modelUsage.outputReasoning,
                );

                totalInput += modelUsage.input;
                totalOutput += modelUsage.output;
                totalTokens += modelUsage.total;
                totalOutputReasoning += modelUsage.outputReasoning;
                totalCostAllModels += cost.totalCost;
            }
        }

        return {
            input: totalInput,
            output: totalOutput,
            total: totalTokens,
            outputReasoning: totalOutputReasoning,
            totalCost: totalCostAllModels,
        };
    }, [filteredData, selectedModels, pricing]);

    const getXAccessor = () => {
        switch (currentFilter) {
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

    const averageCost = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return 0;

        const uniqueItems = new Set(
            filteredData.map((d) => d[xAccessor as keyof BaseUsageContract]),
        );
        const numberOfUniqueItems = uniqueItems.size;

        if (numberOfUniqueItems === 0) return 0;

        return totalUsage.totalCost / numberOfUniqueItems;
    }, [filteredData, totalUsage.totalCost, xAccessor]);

    // Filter pricing to only include selected models
    const filteredPricing = useMemo(() => {
        const result: Record<string, ModelPricingInfo> = {};
        for (const model of selectedModels) {
            if (pricing[model]) {
                result[model] = pricing[model];
            }
        }
        return result;
    }, [pricing, selectedModels]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Filters Row */}
            <div className="flex items-center justify-between gap-4">
                <Filters models={models} filters={filters} />
                <DateRangePicker cookieValue={cookieValue} />
            </div>

            {/* Token Summary */}
            <SummaryCards totalUsage={totalUsage} />

            {/* Cost & Pricing Row */}
            <CostCards
                totalCost={totalUsage.totalCost}
                averageCost={averageCost}
                xAccessor={xAccessor}
                pricing={filteredPricing}
            />

            {/* Chart */}
            <Card className="h-[420px] p-5">
                {filteredData && filteredData.length > 0 ? (
                    <Chart data={filteredData} filterType={currentFilter} />
                ) : (
                    <NoData />
                )}
            </Card>
        </div>
    );
};
