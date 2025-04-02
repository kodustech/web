import { typedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";

import { TEAMS_PATHS } from ".";
import { Team, TeamWithIntegrations } from "./types";

export const getTeams = async () =>
    typedFetch<Team[]>(TEAMS_PATHS.LIST_ALL, {
        next: { tags: ["teams-list"] },
    });

export const getTeamsWithIntegrations = async (): Promise<
    { data: TeamWithIntegrations[] } | { error: string }
> => {
    try {
        const response = await axiosAuthorized.fetcher(
            TEAMS_PATHS.LIST_WITH_INTEGRATIONS,
        );

        return response;
    } catch (error: any) {
        return { error: error.response?.status || "Unknown error" };
    }
};
