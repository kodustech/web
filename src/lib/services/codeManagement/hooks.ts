import { Select } from "@services/setup/types";
import { IntegrationsCommon } from "src/core/types";
import { pathToApiUrl } from "src/core/utils/helpers";
import { useFetch, useSuspenseFetch } from "src/core/utils/reactQuery";

import {
    CODE_MANAGEMENT_API_PATHS,
    type GitFileOrFolder,
    type Repository,
} from "./types";

export function useVerifyConnection(teamId: string) {
    return useFetch<any>(
        CODE_MANAGEMENT_API_PATHS.VERIFY_CONNECTION,
        {
            params: { teamId },
        },
        !!teamId,
    );
}

export function useGetCodeManagementMembers() {
    return useFetch<Select[]>(CODE_MANAGEMENT_API_PATHS.LIST_MEMBERS);
}

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
}) {
    return useSuspenseFetch<{ repository: string; tree: GitFileOrFolder[] }>(
        pathToApiUrl("/code-management/get-repository-tree"),
        { params },
    );
}

export function useSuspenseGetOnboardingPullRequests(teamId: string) {
    return useSuspenseFetch<
        {
            id: string;
            pull_number: number;
            repository: string;
            title: string;
            url: string;
        }[]
    >(CODE_MANAGEMENT_API_PATHS.GET_ONBOARDING_PULL_REQUESTS, {
        params: { teamId },
    });
}
