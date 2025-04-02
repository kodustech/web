import { analyticsFetch, type AnalyticsParams } from "../utils";

export const getDeployFrequencyAnalytics = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<{
        currentPeriod: {
            totalDeployments: number;
            averagePerWeek: number;
        };
        previousPeriod: {
            totalDeployments: number;
            averagePerWeek: number;
        };
        comparison: {
            percentageChange: number;
            trend: string;
        };
    }>(`/productivity/highlights/deploy-frequency`, {
        params: { endDate, startDate },
    });
};

export const getLeadTimeForChangeAnalytics = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<{
        currentPeriod: {
            leadTimeP75Minutes: number;
            leadTimeP75Hours: number;
        };
        previousPeriod: {
            leadTimeP75Minutes: number;
            leadTimeP75Hours: number;
        };
        comparison: {
            percentageChange: number;
            trend: string;
        };
    }>(`/productivity/highlights/lead-time-for-change`, {
        params: { endDate, startDate },
    });
};

export const getLeadTimeForChange = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<
        Array<{
            weekStart: string;
            leadTimeP75Minutes: number;
            leadTimeP75Hours: number;
        }>
    >(`/productivity/charts/lead-time-for-change`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-date-range-dependent"] },
    });
};

export const getPRSizeAnalytics = ({
    endDate = new Date().toISOString(),
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<{
        currentPeriod: {
            averagePRSize: number;
            totalPRs: number;
        };
        previousPeriod: {
            averagePRSize: number;
            totalPRs: number;
        };
        comparison: {
            percentageChange: number;
            trend: string;
        };
    }>(`/productivity/highlights/pr-size`, {
        params: { endDate, startDate },
    });
};

export const getPRsByDeveloper = ({ endDate, startDate }: AnalyticsParams) => {
    return analyticsFetch<
        Array<{
            author: string;
            prCount: number;
            weekStart: string;
        }>
    >(`/productivity/charts/pull-requests-by-developer`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-date-range-dependent"] },
    });
};

export const getPRsOpenedVsClosed = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<
        Array<{
            weekStart: string;
            openedCount: number;
            closedCount: number;
            ratio: number;
        }>
    >(`/productivity/charts/pull-requests-opened-vs-closed`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-date-range-dependent"] },
    });
};

export const getLeadTimeBreakdown = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<
        Array<{
            weekStart: string;
            prCount: number;
            codingTimeMinutes: number;
            codingTimeHours: number;
            pickupTimeMinutes: number;
            pickupTimeHours: number;
            reviewTimeMinutes: number;
            reviewTimeHours: number;
            totalTimeMinutes: number;
            totalTimeHours: number;
        }>
    >(`/productivity/charts/lead-time-breakdown`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-date-range-dependent"] },
    });
};

export const getDeveloperActivity = ({
    endDate,
    startDate,
}: AnalyticsParams) => {
    return analyticsFetch<
        Array<{
            developer: string;
            date: string;
            commitCount: number;
            prCount: number;
        }>
    >(`/productivity/charts/developer-activity`, {
        params: { endDate, startDate },
        next: { tags: ["cockpit-date-range-dependent"] },
    });
};
