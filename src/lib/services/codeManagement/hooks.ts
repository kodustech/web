import { Select } from "@services/setup/types";
import { IntegrationsCommon } from "src/core/types";
import { pathToApiUrl } from "src/core/utils/helpers";
import { useFetch, useSuspenseFetch } from "src/core/utils/reactQuery";

import {
    CODE_MANAGEMENT_API_PATHS,
    type GitFileOrFolder,
    type Repository,
} from "./types";

// TODO: remove, unused
export function useVerifyConnection(teamId: string) {
    return useFetch<any>(
        CODE_MANAGEMENT_API_PATHS.VERIFY_CONNECTION,
        {
            params: { teamId },
        },
        !!teamId,
    );
}

// TODO: remove, unused
export function useGetCodeManagementMembers() {
    return useFetch<Select[]>(CODE_MANAGEMENT_API_PATHS.LIST_MEMBERS);
}

// TODO: remove, unused
export function useGetOrganizations() {
    return useFetch<IntegrationsCommon[]>(
        CODE_MANAGEMENT_API_PATHS.GET_ORGANIZATIONS,
    );
}

export function useGetRepositories(
    teamId: string,
    organizationSelected?: any,
    filters?: { isSelected?: boolean },
) {
    return useFetch<Repository[]>(
        CODE_MANAGEMENT_API_PATHS.GET_REPOSITORIES_ORG,
        {
            params: { teamId, organizationSelected, ...(filters || {}) },
        },
    );
}

export function useSuspenseGetRepositoryTree(params: {
    organizationId: string;
    repositoryId: string;
    teamId?: string;
    treeType?: "directories" | "files";
    useCache?: boolean;
}) {
    return useSuspenseFetch<{ repository: string; tree: GitFileOrFolder[] }>(
        pathToApiUrl("/code-management/get-repository-tree"),
        { params },
    );
}

export function useSuspenseGetOnboardingPullRequests(teamId: string) {
    const rawData = useSuspenseFetch<
        {
            id: string;
            pull_number: number;
            repository: {
                id: string;
                name: string;
            };
            title: string;
            url: string;
        }[]
    >(CODE_MANAGEMENT_API_PATHS.GET_ONBOARDING_PULL_REQUESTS, {
        params: { teamId },
    });

    // Transform to legacy format for compatibility
    return rawData.map((pr) => ({
        id: pr.id,
        pull_number: pr.pull_number,
        repository: pr.repository.name, // Extract name from repository object
        repositoryId: pr.repository.id,
        title: pr.title,
        url: pr.url,
    }));
}

export function useSearchPullRequests(
    teamId: string,
    searchParams: {
        number?: string;
        title?: string;
        repositoryId?: string;
    } = {},
) {
    console.log("🌐 useSearchPullRequests - Debug:");
    console.log("  📋 Search Params:", searchParams);
    console.log("  👥 Team ID:", teamId);
    console.log(
        "  🌍 URL:",
        CODE_MANAGEMENT_API_PATHS.GET_ONBOARDING_PULL_REQUESTS,
    );

    return useFetch<
        {
            id: string;
            pull_number: number;
            repository: {
                id: string;
                name: string;
            };
            title: string;
            url: string;
        }[]
    >(
        CODE_MANAGEMENT_API_PATHS.GET_ONBOARDING_PULL_REQUESTS,
        {
            params: {
                teamId,
                ...searchParams,
            },
        },
        true, // Always enabled
        {
            refetchOnWindowFocus: false,
            staleTime: 0, // No cache - always fresh data
            gcTime: 0, // Don't cache results
        },
    );
}

export { useDebouncedPRSearch } from "./hooks/use-debounced-pr-search";
