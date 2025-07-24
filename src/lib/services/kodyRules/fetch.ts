import { typedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";

import { KODY_RULES_PATHS } from ".";
import type { KodyRule, KodyRulesStatus, LibraryRule } from "./types";

export const createOrUpdateKodyRule = async (
    rule: KodyRule,
    repositoryId?: string,
) => {
    const response = await axiosAuthorized.post<any>(
        KODY_RULES_PATHS.CREATE_OR_UPDATE,
        {
            ...rule,
            repositoryId,
        },
    );

    return response.data as KodyRule;
};

export const addKodyRuleToRepositories = async (
    repositoriesIds: (string | undefined)[],
    rule: Omit<KodyRule, "repositoryId" | "uuid">,
) => {
    const response = await axiosAuthorized.post<any>(
        KODY_RULES_PATHS.ADD_LIBRARY_KODY_RULES,
        {
            ...rule,
            repositoriesIds,
        } satisfies Omit<KodyRule, "repositoryId" | "uuid"> & {
            repositoriesIds: (string | undefined)[];
        },
    );

    return response.data as KodyRule[];
};

export const deleteKodyRule = async (ruleId: string) => {
    const response = await axiosAuthorized.deleted<any>(
        KODY_RULES_PATHS.DELETE_BY_ORGANIZATION_ID_AND_ROLE_UUID,
        { params: { ruleId } },
    );

    return response.data;
};

export const getLibraryKodyRules = async () => {
    const rules = await typedFetch<Record<string, Array<LibraryRule>>>(
        KODY_RULES_PATHS.FIND_LIBRARY_KODY_RULES,
    );
    return Object.values(rules).flat();
};

export const getKodyRulesByRepositoryId = async (
    repositoryId: string,
    tags?: string[],
) => {
    const rules = await typedFetch<Array<KodyRule>>(
        KODY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER,
        {
            params: { repositoryId },
            next: { tags },
        },
    );
    return rules;
};

export const changeStatusKodyRules = async (
    ruleIds: string[],
    status: KodyRulesStatus,
) => {
    const response = await axiosAuthorized.post<any>(
        KODY_RULES_PATHS.CHANGE_STATUS_KODY_RULES,
        { ruleIds, status },
    );

    return response.data as KodyRule[];
};
