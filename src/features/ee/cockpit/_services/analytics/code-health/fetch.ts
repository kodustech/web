import { analyticsFetch, type AnalyticsParams } from "../utils";

export const getCodeHealthSuggestionsByCategory = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<
        Array<{
            category: string;
            count: number;
        }>
    >(`/code-health/charts/suggestions-by-category`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-date-range-dependent", "cockpit-repository-dependent"] },
    });
};

export const getCodeHealthSuggestionsByRepository = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<
        Array<{
            repository: string;
            totalCount: number;
            categories: Array<{
                category: string;
                count: number;
            }>;
        }>
    >(`/code-health/charts/suggestions-by-repository`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-date-range-dependent", "cockpit-repository-dependent"] },
    });
};

export const getCodeHealthBugRatioAnalytics = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<{
        currentPeriod: {
            totalPRs: number;
            bugFixPRs: number;
            ratio: number;
        };
        previousPeriod: {
            totalPRs: number;
            bugFixPRs: number;
            ratio: number;
        };
        comparison: {
            percentageChange: number;
            trend: string;
        };
    }>(`/code-health/highlights/bug-ratio`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-repository-dependent"] },
    });
};
