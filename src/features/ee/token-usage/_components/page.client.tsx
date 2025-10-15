"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@components/ui/card";
import { DateRangePicker } from "src/features/ee/cockpit/_components/date-range-picker";

import { Chart } from "./chart";
import { Filters } from "./filters";
import { NoData } from "./no-data";

export const TokenUsagePageClient = ({
    data,
    cookieValue,
}: {
    data: any[];
    cookieValue: string | undefined;
}) => {
    const searchParams = useSearchParams();
    const filterType = searchParams.get("filter") ?? "daily";

    const totalUsage = useMemo(() => {
        if (!data) {
            return { input: 0, output: 0, total: 0, outputReasoning: 0 };
        }
        return data.reduce(
            (acc, day) => {
                acc.input += day?.input ?? 0;
                acc.output += day?.output ?? 0;
                acc.total += day?.total ?? 0;
                acc.outputReasoning += day?.outputReasoning ?? 0;
                return acc;
            },
            { input: 0, output: 0, total: 0, outputReasoning: 0 },
        );
    }, [data]);

    console.log(data);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between">
                <Filters />
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
                    <div className="text-sm text-gray-500">
                        Total Output (Reasoning)
                    </div>
                    <div className="text-2xl font-bold">
                        {totalUsage.outputReasoning.toLocaleString()}
                    </div>
                </Card>
            </div>
            <Card className="h-[500px] p-4">
                {data && data.length > 0 ? (
                    <Chart data={data} filterType={filterType} />
                ) : (
                    <NoData />
                )}
            </Card>
        </div>
    );
};
