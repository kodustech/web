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
import { CookieName } from "src/core/utils/cookie";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { isBYOKSubscriptionPlan } from "src/features/ee/byok/_utils";
import { getSelectedDateRange } from "src/features/ee/cockpit/_helpers/get-selected-date-range";
import { validateOrganizationLicense } from "src/features/ee/subscription/_services/billing/fetch";

import { TokenUsagePageClient } from "./_components/page.client";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

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

    if (!isBYOKSubscriptionPlan(subscription)) {
        redirect("/settings");
    }

    const byok = await getBYOK();

    if (!byok || !byok.main) {
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
        model: params.model,
    };

    let data: any[] = [];
    const filterType = params.filter ?? "daily";

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

    const [mainPricing, fallbackPricing] = await Promise.all([
        getTokenPricing(byok.main.provider, byok.main.model),
        byok.fallback
            ? getTokenPricing(byok.fallback.provider, byok.fallback.model)
            : undefined,
    ]);

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
                    byok={byok}
                    pricing={{
                        main: mainPricing,
                        fallback: fallbackPricing,
                    }}
                />
            </Page.Content>
        </Page.Root>
    );
}
