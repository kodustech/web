"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { magicModal } from "@components/ui/magic-modal";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { ModelPricingInfo } from "@services/usage/types";
import { Edit, HelpCircleIcon, Info } from "lucide-react";
import { DateRangePicker } from "src/features/ee/cockpit/_components/date-range-picker";

import { BYOKConfig } from "../../byok/_types";
import { Chart } from "./chart";
import { Filters } from "./filters";
import { NoData } from "./no-data";
import { TokenPricingModal } from "./pricing.modal";

const M = 1_000_000;

const calculateCost = (
    model: ModelPricingInfo,
    inputTokens: number,
    outputTokens: number,
    outputReasoningTokens: number,
) => {
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
    byok,
    pricing,
}: {
    data: any[];
    cookieValue: string | undefined;
    byok: {
        main: BYOKConfig;
        fallback?: BYOKConfig;
    };
    pricing: {
        main: ModelPricingInfo;
        fallback?: ModelPricingInfo;
    };
}) => {
    const searchParams = useSearchParams();
    const filterType = searchParams.get("filter") ?? "daily";
    const [customPricing, setCustomPricing] = useState(pricing);

    const totalUsage: {
        input: number;
        output: number;
        total: number;
        outputReasoning: number;
        inputCost: number;
        outputCost: number;
        outputReasoningCost: number;
        totalCost: number;
        main: Record<string, number>;
        fallback: Record<string, number>;
    } = useMemo(() => {
        if (!data) {
            return {
                input: 0,
                output: 0,
                total: 0,
                outputReasoning: 0,
                inputCost: 0,
                outputCost: 0,
                outputReasoningCost: 0,
                totalCost: 0,
                main: {},
                fallback: {},
            };
        }

        const usage = {
            main: { input: 0, output: 0, total: 0, outputReasoning: 0 },
            fallback: { input: 0, output: 0, total: 0, outputReasoning: 0 },
        };

        data.forEach((day) => {
            if (day.model === byok.main.model) {
                usage.main.input += day?.input ?? 0;
                usage.main.output += day?.output ?? 0;
                usage.main.total += day?.total ?? 0;
                usage.main.outputReasoning += day?.outputReasoning ?? 0;
            } else if (byok.fallback && day.model === byok.fallback.model) {
                usage.fallback.input += day?.input ?? 0;
                usage.fallback.output += day?.output ?? 0;
                usage.fallback.total += day?.total ?? 0;
                usage.fallback.outputReasoning += day?.outputReasoning ?? 0;
            }
        });

        const mainCost = calculateCost(
            customPricing.main,
            usage.main.input,
            usage.main.output,
            usage.main.outputReasoning,
        );

        const fallbackCost =
            byok.fallback && customPricing.fallback
                ? calculateCost(
                      customPricing.fallback,
                      usage.fallback.input,
                      usage.fallback.output,
                      usage.fallback.outputReasoning,
                  )
                : {
                      inputCost: 0,
                      outputCost: 0,
                      outputReasoningCost: 0,
                      totalCost: 0,
                  };

        return {
            input: usage.main.input + usage.fallback.input,
            output: usage.main.output + usage.fallback.output,
            total: usage.main.total + usage.fallback.total,
            outputReasoning:
                usage.main.outputReasoning + usage.fallback.outputReasoning,
            inputCost: mainCost.inputCost + fallbackCost.inputCost,
            outputCost: mainCost.outputCost + fallbackCost.outputCost,
            outputReasoningCost:
                mainCost.outputReasoningCost + fallbackCost.outputReasoningCost,
            totalCost: mainCost.totalCost + fallbackCost.totalCost,
            main: { ...usage.main, ...mainCost },
            fallback: { ...usage.fallback, ...fallbackCost },
        };
    }, [data, customPricing, byok]);

    const getXAccessor = () => {
        switch (filterType) {
            case "daily":
                return "date";
            case "by-pr":
                return "PR";
            case "by-developer":
                return "developer";
            default:
                return "date";
        }
    };

    const xAccessor = getXAccessor();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between">
                <Filters byok={byok} />
                <DateRangePicker cookieValue={cookieValue} />
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Total Input</div>
                    <div className="text-2xl font-bold">
                        {totalUsage.input.toLocaleString()}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Total Output</div>
                    <div className="text-2xl font-bold">
                        {totalUsage.output.toLocaleString()}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Total Tokens</div>
                    <div className="text-2xl font-bold">
                        {totalUsage.total.toLocaleString()}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center text-sm text-gray-500">
                        Total Output (Reasoning){" "}
                        <Tooltip>
                            <TooltipContent className="text-text-primary">
                                Already included in Total Output.
                            </TooltipContent>

                            <TooltipTrigger asChild>
                                <Button variant="cancel" size="icon-xs">
                                    <HelpCircleIcon />
                                </Button>
                            </TooltipTrigger>
                        </Tooltip>
                    </div>
                    <div className="text-2xl font-bold">
                        {totalUsage.outputReasoning.toLocaleString()}
                    </div>
                </Card>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-gray-500">Total Cost</div>
                    <div className="text-2xl font-bold">
                        ${totalUsage.totalCost.toLocaleString()}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-500">
                        Average cost per {xAccessor}
                    </div>
                    <div className="text-2xl font-bold">
                        {data && data.length > 0
                            ? `$${(totalUsage.totalCost / data.length).toFixed(2).toLocaleString()}`
                            : "$0"}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Pricing per 1M tokens</span>
                        <span>
                            <Button
                                size="icon-xs"
                                variant="helper"
                                onClick={() =>
                                    magicModal.show(() => (
                                        <TokenPricingModal
                                            pricing={customPricing}
                                            onPricingChange={setCustomPricing}
                                        />
                                    ))
                                }>
                                <Edit size={16} className="ml-2 inline-block" />
                            </Button>
                        </span>
                    </div>

                    <div className="flex flex-col gap-1 text-sm">
                        <div className="flex justify-between">
                            <span>Main</span>
                            <span>
                                {customPricing.main.pricing.prompt > 0 ||
                                customPricing.main.pricing.completion > 0 ? (
                                    <>
                                        ${customPricing.main.pricing.prompt * M}
                                        /input, $
                                        {customPricing.main.pricing.completion *
                                            M}
                                        /output
                                    </>
                                ) : (
                                    "Free"
                                )}
                            </span>
                        </div>

                        {byok.fallback && customPricing.fallback && (
                            <div className="flex justify-between">
                                <span>Fallback</span>
                                <span>
                                    {customPricing.fallback.pricing.prompt >
                                        0 ||
                                    customPricing.fallback.pricing.completion >
                                        0 ? (
                                        <>
                                            $
                                            {customPricing.fallback.pricing
                                                .prompt * M}
                                            /input, $
                                            {customPricing.fallback.pricing
                                                .completion * M}
                                            /output
                                        </>
                                    ) : (
                                        "Free"
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
            <Card className="h-[500px] p-4">
                {data && data.length > 0 ? (
                    <Chart data={data} filterType={filterType} />
                ) : (
                    <NoData />
                )}{" "}
            </Card>
        </div>
    );
};

const NoDeveloperInput = () => {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <p className="text-gray-500">
                Please enter a developer name to see the token usage.
            </p>
        </div>
    );
};
