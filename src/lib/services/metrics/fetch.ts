import { typedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";

import { FLOW_METRICS_PATH } from ".";
import type { Metric } from "./types";

export const getTeamsFlowMetrics = async (teamId: string) => {
    return typedFetch<Metric[]>(FLOW_METRICS_PATH.GET_TEAM_FLOW_METRICS, {
        params: { teamId },
        next: { tags: ["cockpit-date-range-dependent"] },
    });
};

export const getTeamsChartsFlowData = async (
    teamId: string,
    startDate?: string,
    endDate?: string,
    newItemsFrom?: string,
) => {
    try {
        const response = await axiosAuthorized.fetcher(
            FLOW_METRICS_PATH.GET_TEAM_CHART_FLOW_DATA,
            {
                params: {
                    teamId: teamId,
                    startDate,
                    endDate,
                    newItemsFrom,
                },
            },
        );
        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Unknown error" };
    }
};
