import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Page } from "@components/ui/page";
import { getBYOK } from "@services/organizationParameters/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import {
    getDailyTokenUsage,
    getTokenPricing,
    getTokenUsageByDeveloper,
    getTokenUsageByPR,
} from "@services/usage/fetch";
import { BaseUsageContract } from "@services/usage/types";
import { CookieName } from "src/core/utils/cookie";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";
import { isBYOKSubscriptionPlan } from "src/features/ee/byok/_utils";
import { getSelectedDateRange } from "src/features/ee/cockpit/_helpers/get-selected-date-range";
import { validateOrganizationLicense } from "src/features/ee/subscription/_services/billing/fetch";

import { TokenUsagePageClient } from "./_components/page.client";

export default async function TokenUsagePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const logsPagesFeatureFlag = await getFeatureFlagWithPayload({
        feature: "token-usage-page",
    });

    if (!logsPagesFeatureFlag?.value) {
        notFound();
    }

    const params = await searchParams;
    const teamId = await getGlobalSelectedTeamId();
    const subscription = await validateOrganizationLicense({ teamId });
    const isBYOK = isBYOKSubscriptionPlan(subscription);
    const isTrial = subscription.subscriptionStatus === "trial";

    if (!isBYOK && !isTrial) {
        redirect("/settings");
    }

    const cookieStore = await cookies();

    const [organizationId, selectedDateRange] = await Promise.all([
        getOrganizationId(),
        getSelectedDateRange(),
    ]);

    const filters = {
        organizationId,
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

    const uniqueModels: string[] = Array.from(
        new Set(data.map((d) => d.model)),
    );

    let pricing = {};
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
