import { useFetch } from "src/core/utils/reactQuery";
import { PULL_REQUEST_API, type PullRequestFilters } from "./fetch";
import type { PullRequestExecution, PullRequestExecutionsResponse } from "./types";

export const usePullRequestExecutions = (filters?: PullRequestFilters) => {
    const url = PULL_REQUEST_API.GET_EXECUTIONS(filters);
    
    const { data: response, ...query } = useFetch<PullRequestExecutionsResponse>(
        url,
        undefined,
        true,
        {
            placeholderData: (prev) => prev,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
        },
    );

    const data = response?.data ?? [];

    return { ...query, data };
};
