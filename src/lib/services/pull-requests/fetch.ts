import { pathToApiUrl } from "src/core/utils/helpers";

export interface PullRequestFilters {
    teamId?: string;
    repositoryId?: string;
    repositoryName?: string;
    limit?: number;
    page?: number;
    pullRequestTitle?: string;
    hasSentSuggestions?: boolean;
}

export const PULL_REQUEST_API = {
    GET_EXECUTIONS: (filters?: PullRequestFilters) => {
        const params = new URLSearchParams();

        if (filters?.teamId) params.append("teamId", filters.teamId);
        if (filters?.repositoryId)
            params.append("repositoryId", filters.repositoryId);
        if (filters?.repositoryName)
            params.append("repositoryName", filters.repositoryName);
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.pullRequestTitle)
            params.append("pullRequestTitle", filters.pullRequestTitle);
        if (typeof filters?.hasSentSuggestions === "boolean")
            params.append(
                "hasSentSuggestions",
                filters.hasSentSuggestions.toString(),
            );

        const queryString = params.toString();
        return pathToApiUrl(
            `/pull-requests/executions${queryString ? `?${queryString}` : ""}`,
        );
    },
} as const;
