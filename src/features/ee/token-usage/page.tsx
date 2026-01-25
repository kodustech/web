import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Page } from "@components/ui/page";
import {
    getDailyTokenUsage,
    getTokenPricing,
    getTokenUsageByDeveloper,
    getTokenUsageByPR,
} from "@services/usage/fetch";
import {
    BaseUsageContract,
    UsageByPrResultContract,
} from "@services/usage/types";
import { FEATURE_FLAGS } from "src/core/config/feature-flags";
import { CookieName } from "src/core/utils/cookie";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { isFeatureEnabled } from "src/core/utils/posthog-server-side";
import { isBYOKSubscriptionPlan } from "src/features/ee/byok/_utils";
import { getSelectedDateRange } from "src/features/ee/cockpit/_helpers/get-selected-date-range";
import { validateOrganizationLicense } from "src/features/ee/subscription/_services/billing/fetch";

import { TokenUsagePageClient } from "./_components/page.client";

export default async function TokenUsagePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const tokenUsagePageFeatureFlag = await isFeatureEnabled({
        feature: FEATURE_FLAGS.tokenUsagePage,
    });

    if (!tokenUsagePageFeatureFlag) {
        notFound();
    }

    const params = await searchParams;
    const teamId = await getGlobalSelectedTeamId();
    const subscription = await validateOrganizationLicense({ teamId }).catch(
        () => null,
    );

    if (!subscription) {
        redirect("/settings");
    }

    const isBYOK = isBYOKSubscriptionPlan(subscription);
    const isTrial = subscription.subscriptionStatus === "trial";

    if (!isBYOK && !isTrial) {
        redirect("/settings");
    }

    const cookieStore = await cookies();

    const selectedDateRange = await getSelectedDateRange();

    const filters = {
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
        prNumber: params.prNumber ? Number(params.prNumber) : undefined,
        developer: params.developer,
        byok: isBYOK,
    };

    let data: BaseUsageContract[] = [];
    const filterType = params.filter ?? "daily";

    try {
        switch (filterType) {
            case "daily":
                data = await getDailyTokenUsage(filters);
                break;
            case "by-pr":
                data = await getTokenUsageByPR(filters);
                break;
            case "by-developer":
                data = await getTokenUsageByDeveloper(filters);
                break;
            default:
                data = await getDailyTokenUsage(filters);
        }
    } catch (error) {
        console.error("Failed to fetch token usage data:", error);
    }

    const ENABLE_MOCK_DATA = false;

    if (ENABLE_MOCK_DATA && filterType === "by-pr") {
        const mockData: UsageByPrResultContract[] = [];

        for (let i = 1; i <= 30; i++) {
            const isOutlier = i === 15;
            const isHighUsage = i === 5 || i === 22;

            const baseInput = isOutlier
                ? 15000000
                : isHighUsage
                  ? 50000
                  : Math.random() * 5000 + 1000;
            const baseOutput = isOutlier
                ? 8000000
                : isHighUsage
                  ? 30000
                  : Math.random() * 3000 + 500;
            const baseReasoning = isOutlier
                ? 2000000
                : isHighUsage
                  ? 10000
                  : Math.random() * 1000 + 200;

            const input = Math.floor(baseInput);
            const output = Math.floor(baseOutput);
            const outputReasoning = Math.floor(baseReasoning);

            mockData.push({
                model: "claude-3-5-sonnet-20241022",
                input,
                output,
                outputReasoning,
                total: input + output + outputReasoning,
                prNumber: i,
            });
        }

        data = mockData;
    }

    const uniqueModels: string[] = Array.from(
        new Set(data.map((d) => d.model)),
    );

    let pricing = {};

    if (ENABLE_MOCK_DATA && filterType === "by-pr") {
        pricing = {
            "claude-3-5-sonnet-20241022": {
                id: "claude-3-5-sonnet-20241022",
                pricing: {
                    prompt: 3.0,
                    completion: 15.0,
                    internal_reasoning: 15.0,
                },
            },
        };
    } else {
        try {
            const pricingPromises = uniqueModels.map(async (model) => {
                const pricingInfo = await getTokenPricing(model);
                return { [model]: pricingInfo };
            });

            const pricingArray = await Promise.all(pricingPromises);
            pricing = Object.assign({}, ...pricingArray);
        } catch (error) {
            console.error("Failed to fetch pricing data:", error);
        }
    }

    const dateRangeCookieValue = cookieStore.get(
        "cockpit-selected-date-range" satisfies CookieName,
    )?.value;

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>Token Usage</Page.Title>
            </Page.Header>
            <Page.Content>
                <TokenUsagePageClient
                    data={data}
                    cookieValue={dateRangeCookieValue}
                    models={uniqueModels}
                    pricing={pricing}
                />
            </Page.Content>
        </Page.Root>
    );
}
