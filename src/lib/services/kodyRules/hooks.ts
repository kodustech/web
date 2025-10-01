import { useSuspenseFetch } from "src/core/utils/reactQuery";

import { KODY_RULES_PATHS } from ".";
import type { KodyRule, LibraryRule } from "./types";

export const useSuspenseFindLibraryKodyRules = () => {
    const rules = useSuspenseFetch<Record<string, Array<LibraryRule>>>(
        KODY_RULES_PATHS.FIND_LIBRARY_KODY_RULES,
    );

    return Object.values(rules).flat();
};

export const useSuspenseFindLibraryKodyRulesWithFeedback = () => {
    const response = useSuspenseFetch<{ data: Array<LibraryRule> }>(
        KODY_RULES_PATHS.FIND_LIBRARY_KODY_RULES_WITH_FEEDBACK,
    );

    return response.data;
};

export const useSuspenseKodyRulesByRepositoryId = (
    repositoryId: string,
    directoryId?: string,
) => {
    return useSuspenseFetch<Array<KodyRule>>(
        KODY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER,
        { params: { repositoryId, directoryId } },
    );
};

export const useSuspenseKodyRulesCheckSyncStatus = (params: {
    teamId: string;
    repositoryId: string;
}) => {
    return useSuspenseFetch<{
        ideRulesSyncEnabledFirstTime: boolean;
        kodyRulesGeneratorEnabledFirstTime: boolean;
    }>(KODY_RULES_PATHS.CHECK_SYNC_STATUS, { params });
};

export const useSuspenseGetInheritedKodyRules = (params: {
    teamId: string;
    repositoryId: string;
    directoryId?: string;
}) => {
    return useSuspenseFetch<{
        allRules: KodyRule[];
        globalRules: KodyRule[];
        repoRules: KodyRule[];
        directoryRules: KodyRule[];
        excludedRules: KodyRule[];
    }>(KODY_RULES_PATHS.GET_INHERITED_RULES, { params });
};
