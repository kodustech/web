import {
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { DashedLine } from "@components/ui/dashed-line";
import { Separator } from "@components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { formatISO, subWeeks } from "date-fns";
import { getDeployFrequencyAnalytics } from "src/features/ee/cockpit/_services/analytics/productivity/fetch";
import { getPercentageDiff } from "src/features/ee/cockpit/_services/analytics/utils";

import { InsightsBadge } from "../_components/insights-badge";
import { PercentageDiff } from "../_components/percentage-diff";

const comparisonParameters = {
    "elite": {
        label: "> 5/week",
        compareFn: (value: number) => value > 5,
    },
    "high": {
        label: "2-5/week",
        compareFn: (value: number) => value >= 2 && value <= 5,
    },
    "fair": {
        label: "1-2/week",
        compareFn: (value: number) => value >= 1 && value <= 2,
    },
    "need-focus": {
        label: "< 1/week",
        compareFn: (value: number) => value < 1,
    },
} satisfies Record<
    React.ComponentProps<typeof InsightsBadge>["type"],
    {
        label: string;
        compareFn: (value: number) => boolean;
    }
>;

export default async function DeployFrequencyAnalytics() {
    const endDate = new Date();
    const startDate = subWeeks(endDate, 2);

    const data = await getDeployFrequencyAnalytics({
        startDate: formatISO(startDate, { representation: "date" }),
        endDate: formatISO(endDate, { representation: "date" }),
    });

    const [badge] = Object.entries(comparisonParameters).find(
        ([, { compareFn }]) => compareFn(data?.currentPeriod?.averagePerWeek),
    )!;

    return (
        <>
            <CardHeader>
                <div className="flex justify-between gap-4">
                    <CardTitle className="text-sm">Deploy Frequency</CardTitle>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <InsightsBadge
                                type={
                                    badge as React.ComponentProps<
                                        typeof InsightsBadge
                                    >["type"]
                                }
                            />
                        </TooltipTrigger>

                        <TooltipContent
                            className="w-96 p-5 text-sm shadow-2xl"
                            align="end">
                            <span className="mb-4 flex font-bold">
                                Deploy Frequency Parameters
                            </span>

                            <div className="flex flex-col gap-2 children:flex children:justify-between">
                                <div className="text-muted-foreground">
                                    <span>Deploys/week</span>
                                    <span>Level</span>
                                </div>

                                <Separator />

                                {Object.entries(comparisonParameters).map(
                                    ([key, { label }]) => (
                                        <div key={key}>
                                            <span className="shrink-0">
                                                {label}
                                            </span>
                                            <DashedLine />
                                            <InsightsBadge
                                                type={
                                                    key as React.ComponentProps<
                                                        typeof InsightsBadge
                                                    >["type"]
                                                }
                                            />
                                        </div>
                                    ),
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </CardHeader>

            <CardContent className="flex items-center justify-center text-3xl font-bold">
                {data?.currentPeriod?.averagePerWeek}
                <small>/week</small>
            </CardContent>

            <CardFooter className="flex gap-1 text-xs text-muted-foreground">
                <span>
                    Last 2 weeks was {data?.previousPeriod?.averagePerWeek}
                    /week
                </span>
                <PercentageDiff
                    status={getPercentageDiff(data?.comparison)}
                    mode="higher-is-better">
                    {data?.comparison?.percentageChange}%
                </PercentageDiff>
            </CardFooter>
        </>
    );
}
