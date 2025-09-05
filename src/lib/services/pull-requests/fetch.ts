import { pathToApiUrl } from "src/core/utils/helpers";
import { authorizedFetch } from "../fetch";
import type { PullRequestExecutionsResponse } from "./types";

export interface PullRequestFilters {
    repositoryId?: string;
    repositoryName?: string;
    limit?: number;
    page?: number;
}

export const PULL_REQUEST_API = {
    GET_EXECUTIONS: (filters?: PullRequestFilters) => {
        const params = new URLSearchParams();
        
        if (filters?.repositoryId) params.append('repositoryId', filters.repositoryId);
        if (filters?.repositoryName) params.append('repositoryName', filters.repositoryName);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.page) params.append('page', filters.page.toString());
        
        const queryString = params.toString();
        return pathToApiUrl(`/pull-requests/executions${queryString ? `?${queryString}` : ''}`);
    },
} as const;

export const fetchPullRequestExecutions = (filters?: PullRequestFilters): Promise<PullRequestExecutionsResponse> => {
    return authorizedFetch<PullRequestExecutionsResponse>(PULL_REQUEST_API.GET_EXECUTIONS(filters));
};
