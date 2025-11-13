import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@hooks/use-debounce";
import {
    useSearchPullRequests,
    useSuspenseGetOnboardingPullRequests,
} from "@services/codeManagement/hooks";
import { buildSearchParams } from "src/core/utils/pr-search";

type PullRequest = {
    id: string;
    pull_number: number;
    repository: string;
    repositoryId: string;
    title: string;
    url: string;
};

interface UseDebouncedPRSearchParams {
    teamId: string;
    repositoryId?: string;
    debounceMs?: number;
}

interface UseDebouncedPRSearchReturn {
    searchInput: string;
    setSearchInput: (input: string) => void;
    pullRequests: PullRequest[];
    isSearching: boolean;
    isLoadingInitial: boolean;
    error: Error | null;
}

/**
 * Hook for searching pull requests with debounce
 * Falls back to initial load when no search is active
 */
export function useDebouncedPRSearch({
    teamId,
    repositoryId,
    debounceMs = 300,
}: UseDebouncedPRSearchParams): UseDebouncedPRSearchReturn {
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearchInput = useDebounce(searchInput, debounceMs);

    // Get search params from debounced input
    const searchParams = useMemo(() => {
        if (!debouncedSearchInput.trim()) {
            return {};
        }

        return buildSearchParams(debouncedSearchInput, teamId, repositoryId);
    }, [debouncedSearchInput, teamId, repositoryId]);

    // Always search via API - include empty search to get all results
    const apiSearchParams = useMemo(() => {
        const baseParams = {
            number: searchParams.number as string,
            title: searchParams.title as string,
            repositoryId: searchParams.repositoryId as string,
        };

        // If no search input, send empty title to get all results
        if (!debouncedSearchInput.trim()) {
            return {
                ...baseParams,
                title: "", // Empty search to get all results
                number: undefined,
            };
        }

        return baseParams;
    }, [searchParams, debouncedSearchInput]);

    // Always use server-side search
    const {
        data: searchResults,
        isLoading: isSearching,
        error,
        refetch,
    } = useSearchPullRequests(teamId, apiSearchParams);

    // Transform search results to match expected format
    const transformedSearchResults = useMemo(() => {
        if (!searchResults || !Array.isArray(searchResults)) return [];

        return searchResults.map((pr) => ({
            id: pr.id,
            pull_number: pr.pull_number,
            repository: pr.repository.name, // Extract name from repository object
            repositoryId: pr.repository.id,
            title: pr.title,
            url: pr.url,
        }));
    }, [searchResults]);

    const pullRequests = useMemo(() => {
        return transformedSearchResults;
    }, [
        debouncedSearchInput,
        apiSearchParams,
        searchResults,
        transformedSearchResults,
        isSearching,
        error,
    ]);

    return {
        searchInput,
        setSearchInput,
        pullRequests,
        isSearching: Boolean(debouncedSearchInput.trim()) && isSearching,
        isLoadingInitial: false, // Since we're using suspense for initial load
        error,
    };
}
