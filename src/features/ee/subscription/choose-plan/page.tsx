import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Page } from "@components/ui/page";
import {
    getDailyTokenUsage,
    getTokenPricing,
    getTokenUsageByDeveloper,
    getTokenUsageByPR,
} from "@services/usage/fetch";
import type { ModelPricingInfo } from "@services/usage/types";
import { differenceInDays, subDays, format } from "date-fns";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { isBYOKSubscriptionPlan } from "src/features/ee/byok/_utils";

import {
    getPlans,
    validateOrganizationLicense,
} from "../_services/billing/fetch";
import type { Plan } from "../_services/billing/types";
import { fetchPopularModels } from "./_services/models";
import { ChoosePlanPageClient } from "./page.client";

const TRIAL_DURATION_DAYS = 14;
const USAGE_LOOKBACK_DAYS = 30;
const MIN_PRS_FOR_PROJECTION = 3;

type PlansObject = Record<
    "free" | "teams_byok" | "enterprise",
    Plan | undefined
>;

function organizePlans(plans: Plan[]): PlansObject {
    return plans.reduce(
        (acc, current) => {
            if (current.type === "contact") {
                acc.enterprise = current;
            } else if (current.id === "free_byok") {
                acc.free = current;
            } else if (current.id === "teams_byok") {
                acc.teams_byok = current;
            }
            return acc;
        },
        {} as PlansObject,
    );
}

function getUsageDateRange(
    license: Awaited<ReturnType<typeof validateOrganizationLicense>> | null,
) {
    const now = new Date();

    if (license?.valid && license.subscriptionStatus === "trial") {
        const trialEndDate = new Date(license.trialEnd);
        const trialStartDate = subDays(trialEndDate, TRIAL_DURATION_DAYS);
        const daysUsed = Math.max(1, differenceInDays(now, trialStartDate));

        return {
            startDate: format(trialStartDate, "yyyy-MM-dd"),
            endDate: format(now, "yyyy-MM-dd"),
            daysUsed,
        };
    }

    const startDate = subDays(now, USAGE_LOOKBACK_DAYS);
    return {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
        daysUsed: USAGE_LOOKBACK_DAYS,
    };
}

async function computeTokenProjection(
    license: Awaited<ReturnType<typeof validateOrganizationLicense>> | null,
) {
    const { startDate, endDate, daysUsed } = getUsageDateRange(license);
    const isBYOK = license ? isBYOKSubscriptionPlan(license) : false;

    const usageFilters = { startDate, endDate, byok: isBYOK };

    try {
        const [dailyUsage, usageByPR, usageByDev] = await Promise.all([
            getDailyTokenUsage(usageFilters),
            getTokenUsageByPR(usageFilters).catch(() => null),
            getTokenUsageByDeveloper(usageFilters).catch(() => null),
        ]);

        if (!dailyUsage || dailyUsage.length === 0) {
            return { projection: null, daysUsed, progress: { current: 0, required: MIN_PRS_FOR_PROJECTION } };
        }

        // Aggregate totals across all days
        let totalInput = 0;
        let totalOutput = 0;
        let totalReasoning = 0;

        const uniqueModels = new Set<string>();
        const uniqueDays = new Set<string>();

        for (const day of dailyUsage) {
            totalInput += day.input ?? 0;
            totalOutput += day.output ?? 0;
            totalReasoning += day.outputReasoning ?? 0;
            if (day.model) uniqueModels.add(day.model);
            if (day.date) uniqueDays.add(day.date);
        }

        if (totalInput + totalOutput + totalReasoning === 0) {
            return { projection: null, daysUsed, progress: { current: 0, required: MIN_PRS_FOR_PROJECTION } };
        }

        // Use actual days with usage instead of calendar days
        const actualDaysUsed = Math.max(1, uniqueDays.size);

        // Count unique PRs and developers
        const uniquePRs = usageByPR
            ? new Set(usageByPR.map((r) => r.prNumber)).size
            : 0;
        const uniqueDevelopers = usageByDev
            ? new Set(usageByDev.map((r) => r.developer)).size
            : 0;

        // Fetch pricing for all models that appeared in actual usage
        const pricingMap: Record<string, ModelPricingInfo> = {};

        const pricingResults = await Promise.allSettled(
            Array.from(uniqueModels).map(async (model) => {
                const pricing = await getTokenPricing(model);
                return { model, pricing };
            }),
        );

        for (const result of pricingResults) {
            if (
                result.status === "fulfilled" &&
                result.value.pricing?.pricing
            ) {
                pricingMap[result.value.model] = result.value.pricing;
            }
        }

        const pricingEntries = Object.values(pricingMap);

        if (pricingEntries.length === 0) {
            return { projection: null, daysUsed, progress: { current: uniquePRs, required: MIN_PRS_FOR_PROJECTION } };
        }

        // Project monthly usage based on actual days with usage
        const monthlyInput = (totalInput / actualDaysUsed) * 30;
        const monthlyOutput = (totalOutput / actualDaysUsed) * 30;
        const monthlyReasoning = (totalReasoning / actualDaysUsed) * 30;

        function computeCost(p: ModelPricingInfo) {
            const prompt = p.pricing.prompt ?? 0;
            const completion = p.pricing.completion ?? 0;
            const reasoning = p.pricing.internal_reasoning ?? 0;

            // Pricing values from the API are per-token (e.g. 3e-7),
            // so we multiply directly by the token count.
            // Note: output already includes outputReasoning, so we calculate:
            // - input tokens at prompt price
            // - non-reasoning output at completion price
            // - reasoning output at reasoning price (if different)
            const nonReasoningOutput = monthlyOutput - monthlyReasoning;

            return (
                monthlyInput * prompt +
                nonReasoningOutput * completion +
                monthlyReasoning * reasoning
            );
        }

        // Compute cost for each model's pricing → range from cheapest to most expensive
        const modelCosts = Object.entries(pricingMap).map(([model, pricing]) => ({
            model,
            cost: computeCost(pricing),
        }));

        modelCosts.sort((a, b) => a.cost - b.cost);

        const cheapest = modelCosts[0];
        const mostExpensive = modelCosts[modelCosts.length - 1];

        if (mostExpensive.cost === 0) {
            return { projection: null, daysUsed, progress: { current: uniquePRs, required: MIN_PRS_FOR_PROJECTION } };
        }

        // Check if we have enough PRs for a meaningful projection
        if (uniquePRs < MIN_PRS_FOR_PROJECTION) {
            return {
                projection: null,
                daysUsed,
                progress: { current: uniquePRs, required: MIN_PRS_FOR_PROJECTION }
            };
        }

        // Project PRs to monthly (same logic as tokens)
        const monthlyPRs = Math.round((uniquePRs / actualDaysUsed) * 30);

        return {
            projection: {
                minCost: cheapest.cost,
                maxCost: mostExpensive.cost,
                minModel: cheapest.model,
                maxModel: mostExpensive.model,
                currency: "USD",
                uniquePRs,
                uniqueDevelopers,
                monthlyPRs,
                actualDaysUsed,
                // Pass monthly token volumes for simulator
                monthlyInputTokens: monthlyInput,
                monthlyOutputTokens: monthlyOutput,
            },
            daysUsed,
            progress: null,
        };
    } catch (error) {
        console.error("Failed to compute token projection:", error);
        return { projection: null, daysUsed, progress: { current: 0, required: MIN_PRS_FOR_PROJECTION } };
    }
}

export default async function ChoosePlanPage() {
    const teamId = await getGlobalSelectedTeamId();

    const [plansData, license, simulatorModels] = await Promise.all([
        getPlans().catch(() => ({ plans: [] as Plan[] })),
        validateOrganizationLicense({ teamId }).catch(() => null),
        fetchPopularModels().catch(() => []),
    ]);

    const plansObject = organizePlans(plansData.plans);
    const { projection, progress } = await computeTokenProjection(license);

    return (
        <Page.Root>
            <Page.Header>
                <div className="flex w-full flex-col gap-1">
                    <Breadcrumb className="mb-1">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/settings/subscription">
                                    Subscription
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Choose plan</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <Page.Title className="text-balance">
                        Choose your plan
                    </Page.Title>
                </div>
            </Page.Header>
            <Page.Content>
                <ChoosePlanPageClient
                    plans={plansObject}
                    tokenProjection={projection}
                    simulatorModels={simulatorModels}
                    usageProgress={progress}
                />
            </Page.Content>
        </Page.Root>
    );
}
