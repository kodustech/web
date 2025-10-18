import { PARAMETERS_PATHS } from "@services/parameters";
import { ParametersConfigKey } from "@services/parameters/types";
import { pathToApiUrl } from "src/core/utils/helpers";
import { useFetch, useSuspenseFetch } from "src/core/utils/reactQuery";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

import type {
    IssueCreationConfigResponse,
    IssueItem,
    IssueListItem,
} from "./types";

export const useIssues = () => {
    const { organizationId } = useOrganizationContext();

    const { data, ...query } = useFetch<IssueListItem[]>(
        pathToApiUrl("/issues"),
        { params: { organizationId } },
        true,
        {
            placeholderData: (prev) => {
                return prev;
            },
            refetchOnMount: true,
            refetchOnWindowFocus: true,
        },
    );

    return { ...query, data: data ?? [] };
};

export const useIssue = (
    id: string | null,
    params?: Parameters<typeof useFetch<IssueItem>>[3],
) => {
    return useFetch<IssueItem>(
        id ? pathToApiUrl(`/issues/${id}`) : null,
        undefined,
        true,
        {
            ...params,
            placeholderData: (prev) => prev,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
        },
    );
};

export const useSuspenseIssuesCount = () =>
    useSuspenseFetch<number>(pathToApiUrl("/issues/count"));

export const useIssueCreationConfig = (teamId: string | undefined) => {
    return useFetch<IssueCreationConfigResponse>(
        PARAMETERS_PATHS.GET_BY_KEY,
        teamId
            ? {
                  params: {
                      key: ParametersConfigKey.ISSUE_CREATION_CONFIG,
                      teamId,
                  },
              }
            : undefined,
        Boolean(teamId),
        {
            retry: false,
        },
    );
};
