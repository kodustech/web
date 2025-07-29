import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Page } from "@components/ui/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { getConnections } from "@services/setup/fetch";
import type { CookieName } from "src/core/utils/cookie";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { greeting } from "src/core/utils/helpers";

import { validateOrganizationLicense } from "../subscription/_services/billing/fetch";
import { DateRangePicker } from "./_components/date-range-picker";
import { RepositoryPicker } from "./_components/repository-picker";
import { CockpitNoDataBanner } from "./_components/no-data-banner";
import { tabs, type TabValue } from "./_constants";
import { getAnalyticsStatus } from "./_services/analytics/fetch";
import { AnalyticsNotAvailable } from "./not-available";

export default async function Layout({
    bugRatioAnalytics,
    codeHealthByCategory,
    codeHealthByRepository,
    deployFrequencyAnalytics,
    flowMetrics,
    leadTimeBreakdownChart,
    prCycleTimeAnalytics,
    prCycleTimeChart,
    prsMergedByDeveloperChart,
    prSizeAnalytics,
    prsOpenedVsClosedChart,
    teamActivityChart,
    kodySuggestions,
    children,
}: React.PropsWithChildren & {
    children: React.ReactNode;
    bugRatioAnalytics: React.ReactNode;
    deployFrequencyAnalytics: React.ReactNode;
    prCycleTimeAnalytics: React.ReactNode;
    prSizeAnalytics: React.ReactNode;
    leadTimeBreakdownChart: React.ReactNode;
    prCycleTimeChart: React.ReactNode;
    prsOpenedVsClosedChart: React.ReactNode;
    prsMergedByDeveloperChart: React.ReactNode;
    teamActivityChart: React.ReactNode;
    codeHealthByCategory: React.ReactNode;
    codeHealthByRepository: React.ReactNode;
    flowMetrics: React.ReactNode;
    kodySuggestions: React.ReactNode;
}) {
    if (!process.env.WEB_ANALYTICS_SECRET) {
        return <AnalyticsNotAvailable />;
    }

    const [cookieStore, selectedTeamId] = await Promise.all([
        cookies(),
        getGlobalSelectedTeamId(),
    ]);

    const organizationLicense = await validateOrganizationLicense({
        teamId: selectedTeamId,
    });
    if (!organizationLicense.valid) redirect("/settings/git");

    const [connections, analyticsResult] = await Promise.all([
        getConnections(selectedTeamId),
        getAnalyticsStatus().catch(() => ({ hasData: false })),
    ]);

    const hasAnalyticsData = analyticsResult?.hasData;

    const dateRangeCookieValue = cookieStore.get(
        "cockpit-selected-date-range" satisfies CookieName,
    )?.value;
    
    const repositoryCookieValue = cookieStore.get(
        "cockpit-selected-repository" satisfies CookieName,
    )?.value;

    const hasJIRAConnected =
        connections?.find(
            (c) =>
                c.platformName === "JIRA" &&
                c.hasConnection &&
                c.isSetupComplete,
        ) !== undefined;

    const entries = Object.entries(tabs);

    return (
        <Page.Root>
            {!hasAnalyticsData && <CockpitNoDataBanner />}

            <Page.Header className="max-w-(--breakpoint-xl)">
                <Page.Title>{greeting()}</Page.Title>
                <div className="ml-auto">
                    <RepositoryPicker
                        cookieValue={repositoryCookieValue}
                        teamId={selectedTeamId}
                    />
                </div>
            </Page.Header>

            <Page.Content className="max-w-(--breakpoint-xl)">
                <div className="grid grid-cols-3 grid-rows-2 gap-2">
                    <div>{deployFrequencyAnalytics}</div>
                    <div>{prCycleTimeAnalytics}</div>
                    <div>{kodySuggestions}</div>
                    <div>{bugRatioAnalytics}</div>
                    <div>{prSizeAnalytics}</div>
                </div>

                <div className="mt-10">
                    <Tabs
                        defaultValue={
                            (hasJIRAConnected
                                ? "flow-metrics"
                                : "productivity") satisfies TabValue
                        }>
                        <TabsList>
                            {entries.map(([value, name]) => {
                                if (
                                    value ===
                                        ("flow-metrics" satisfies TabValue) &&
                                    !hasJIRAConnected
                                ) {
                                    return;
                                }

                                return (
                                    <TabsTrigger key={value} value={value}>
                                        {name}
                                    </TabsTrigger>
                                );
                            })}
                            <div className="flex flex-1 justify-end">
                                <DateRangePicker
                                    cookieValue={dateRangeCookieValue}
                                />
                            </div>
                        </TabsList>

                        <TabsContent value={"flow-metrics" satisfies TabValue}>
                            {flowMetrics}
                        </TabsContent>

                        <TabsContent value={"productivity" satisfies TabValue}>
                            <div className="grid grid-cols-2 gap-2">
                                {leadTimeBreakdownChart}
                                {prCycleTimeChart}
                                {prsOpenedVsClosedChart}
                                {prsMergedByDeveloperChart}

                                <div className="col-span-2">
                                    {teamActivityChart}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value={"code-health" satisfies TabValue}
                            className="flex flex-col gap-6">
                            {codeHealthByCategory}
                            {codeHealthByRepository}
                        </TabsContent>
                    </Tabs>
                </div>

                {children}
            </Page.Content>
        </Page.Root>
    );
}
