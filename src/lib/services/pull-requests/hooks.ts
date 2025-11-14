import { useMemo } from "react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { axiosAuthorized } from "src/core/utils/axios";

import { PULL_REQUEST_API, type PullRequestFilters } from "./fetch";
import type {
    PullRequestExecution,
    PullRequestExecutionsPayload,
    PullRequestExecutionsResponse,
} from "./types";

const normalizeExecutions = (
    payload: PullRequestExecutionsPayload,
): PullRequestExecution[] => {
    if (!payload) return [];

    if (Array.isArray(payload)) return payload;

    if (Array.isArray(payload.data)) return payload.data;

    if (Array.isArray(payload._page_data)) return payload._page_data;

    return [];
};

const DEFAULT_PAGE_SIZE = 30;

export const useInfinitePullRequestExecutions = (
    filters?: PullRequestFilters,
    options?: { pageSize?: number },
) => {
    const pageSize = options?.pageSize ?? filters?.limit ?? DEFAULT_PAGE_SIZE;
    const baseFilters = useMemo<PullRequestFilters>(() => {
        const next: PullRequestFilters = { limit: pageSize };

        if (filters?.repositoryId) next.repositoryId = filters.repositoryId;
        if (filters?.repositoryName)
            next.repositoryName = filters.repositoryName;

        const title = filters?.pullRequestTitle?.trim();
        if (title) {
            next.pullRequestTitle = title;
        }

        if (typeof filters?.hasSentSuggestions === "boolean") {
            next.hasSentSuggestions = filters.hasSentSuggestions;
        }

        return next;
    }, [
        filters?.repositoryId,
        filters?.repositoryName,
        filters?.pullRequestTitle,
        filters?.hasSentSuggestions,
        pageSize,
    ]);

    const { data: infiniteData, ...query } = useInfiniteQuery<
        PullRequestExecutionsResponse,
        Error,
        InfiniteData<PullRequestExecutionsResponse, number>,
        [string, PullRequestFilters],
        number
    >({
        queryKey: ["pull-request-executions", baseFilters],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const params = { ...baseFilters, page: pageParam };
            const url = PULL_REQUEST_API.GET_EXECUTIONS(params);

            return axiosAuthorized.fetcher<PullRequestExecutionsResponse>(url);
        },
        getNextPageParam: (lastPage, allPages) => {
            const lastPageSize = normalizeExecutions(lastPage?.data).length;

            if (lastPageSize < pageSize) {
                return undefined;
            }

            return allPages.length + 1;
        },
        retry: false,
    });

    const items = useMemo(() => {
        const pages = infiniteData?.pages ?? [];
        const map = new Map<string, PullRequestExecution>();

        pages.forEach((page) => {
            normalizeExecutions(page?.data).forEach((pr) => {
                if (pr?.prId) {
                    map.set(pr.prId, pr);
                }
            });
        });

        return Array.from(map.values());
    }, [infiniteData]);

    return { ...query, data: infiniteData, items };
};
