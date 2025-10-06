import { useSuspenseFetch } from "src/core/utils/reactQuery";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

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

export const useSuspenseKodyRulesTotalQuantity = () => {
    return useSuspenseFetch<{ total: number }>(
        KODY_RULES_PATHS.GET_KODY_RULES_TOTAL_QUANTITY,
    ).total;
};

export const useKodyRulesLimits = () => {
    const subscription = useSubscriptionStatus();
    const total = useSuspenseKodyRulesTotalQuantity();

    if (!subscription.valid)
        return {
            total,
            canAddMoreRules: false,
            limit: Number.POSITIVE_INFINITY,
        };

    if (subscription.status === "free" || subscription.status === "self-hosted")
        return { canAddMoreRules: total < 10, total, limit: 10 };

    return { canAddMoreRules: true, total, limit: Number.POSITIVE_INFINITY };
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
