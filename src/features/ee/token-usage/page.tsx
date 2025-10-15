import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Page } from "@components/ui/page";
import { getOrganizationId } from "@services/organizations/fetch";
import {
    getDailyTokenUsage,
    getDailyTokenUsageByDeveloper,
    getDailyTokenUsageByPR,
    getTokenUsageByDeveloper,
    getTokenUsageByPR,
} from "@services/usage/fetch";
import { DailyUsageResultContract } from "@services/usage/types";
import { formatISO, subDays } from "date-fns";
import { CookieName } from "src/core/utils/cookie";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { isBYOKSubscriptionPlan } from "src/features/ee/byok/_utils";
import { getSelectedDateRange } from "src/features/ee/cockpit/_helpers/get-selected-date-range";
import { validateOrganizationLicense } from "src/features/ee/subscription/_services/billing/fetch";

import { TokenUsagePageClient } from "./_components/page.client";

export default async function TokenUsagePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const teamId = await getGlobalSelectedTeamId();
    const subscription = await validateOrganizationLicense({ teamId });

    if (!isBYOKSubscriptionPlan(subscription)) redirect("/settings");

    const cookieStore = await cookies();

    const [organizationId, selectedDateRange] = await Promise.all([
        getOrganizationId(),
        getSelectedDateRange(),
    ]);

    const filters = {
        organizationId,
        startDate: selectedDateRange.startDate,
        endDate: selectedDateRange.endDate,
        prNumber: searchParams.prNumber
            ? Number(searchParams.prNumber)
            : undefined,
        developer: searchParams.developer,
    };

    let data: any[] = [];
    const filterType = searchParams.filter ?? "daily";

    switch (filterType) {
        case "daily":
            data = await getDailyTokenUsage(filters);
            break;
        case "by-pr":
            data = await getTokenUsageByPR(filters);
            break;
        case "daily-by-pr":
            data = await getDailyTokenUsageByPR(filters);
            break;
        case "by-developer":
            data = await getTokenUsageByDeveloper(filters);
            break;
        case "daily-by-developer":
            data = await getDailyTokenUsageByDeveloper(filters);
            break;
        default:
            data = await getDailyTokenUsage(filters);
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
                />
            </Page.Content>
        </Page.Root>
    );
}
