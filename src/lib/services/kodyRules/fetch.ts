import { authorizedFetch } from "@services/fetch";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { axiosAuthorized } from "src/core/utils/axios";

import { KODY_RULES_PATHS } from ".";
import type {
    KodyRule,
    KodyRuleBucket,
    KodyRulesStatus,
    KodyRuleSuggestion,
    LibraryRule,
    PaginatedResponse,
} from "./types";

export type FastSyncIDERulesPayload = {
    teamId: string;
    repositoryId: string;
    maxFiles?: number;
    maxFileSizeBytes?: number;
    maxTotalBytes?: number;
};

export type FastSyncIDERulesResponse = {
    rules: KodyRule[];
    skippedFiles?: unknown[];
    errors?: unknown[];
};

export type ReviewFastIDERulesPayload = {
    teamId: string;
    activateRuleIds?: string[];
    deleteRuleIds?: string[];
};

export type ReviewFastIDERulesResponse = {
    activatedRules?: KodyRule[];
    deletedRules?: KodyRule[];
    errors?: unknown[];
};

export const createOrUpdateKodyRule = async (
    rule: KodyRule,
    repositoryId?: string,
    directoryId?: string,
) => {
    const response = await axiosAuthorized.post<any>(
        KODY_RULES_PATHS.CREATE_OR_UPDATE,
        { ...rule, repositoryId, directoryId },
    );

    return response.data as KodyRule;
};

export const addKodyRuleToRepositories = async (props: {
    repositoriesIds: string[];
    directoriesIds: Array<{ directoryId: string; repositoryId: string }>;
    rule: KodyRule;
}) => {
    const response = await axiosAuthorized.post<any>(
        KODY_RULES_PATHS.ADD_LIBRARY_KODY_RULES,
        {
            ...props.rule,
            repositoriesIds: props.repositoriesIds,
            directoriesInfo: props.directoriesIds,
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

export const getLibraryKodyRulesWithFeedback = async (params?: {
    page?: number;
    limit?: number;
    buckets?: string[];
    name?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    tags?: string[];
    language?: keyof typeof ProgrammingLanguage;
    plug_and_play?: boolean;
}) => {
    // Build params object for authorizedFetch
    const fetchParams: Record<string, string | number | boolean | undefined> = {
        page: params?.page || 1,
        limit: params?.limit || 50,
    };

    // Add other filters if provided
    if (params?.name) fetchParams.title = params.name; // Backend expects 'title' not 'name'
    if (params?.severity) fetchParams.severity = params.severity;
    if (params?.language) fetchParams.language = String(params.language);
    if (params?.plug_and_play) fetchParams.plug_and_play = true;

    // For arrays, we need to handle them as multiple parameters with the same key
    // But since authorizedFetch doesn't handle array params well, we'll build the URL manually
    const queryParams = new URLSearchParams();

    Object.entries(fetchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
        }
    });

    // Add bucket filters as multiple parameters
    if (params?.buckets && params.buckets.length > 0) {
        params.buckets.forEach((bucket) => {
            queryParams.append("buckets", bucket);
        });
    }

    // Add tag filters as multiple parameters
    if (params?.tags && params.tags.length > 0) {
        params.tags.forEach((tag) => {
            queryParams.append("tags", tag);
        });
    }

    const url = `${KODY_RULES_PATHS.FIND_LIBRARY_KODY_RULES_WITH_FEEDBACK}?${queryParams.toString()}`;

    const response = await authorizedFetch<PaginatedResponse<LibraryRule>>(url);
    return response;
};

export const getLibraryKodyRulesBuckets = async () => {
    const response = await authorizedFetch<Array<KodyRuleBucket>>(
        KODY_RULES_PATHS.FIND_LIBRARY_KODY_RULES_BUCKETS,
    );
    return response || [];
};

export const fastSyncIDERules = async (
    payload: FastSyncIDERulesPayload,
): Promise<FastSyncIDERulesResponse> => {
    const response = await axiosAuthorized.post<FastSyncIDERulesResponse>(
        KODY_RULES_PATHS.FAST_SYNC_IDE_RULES,
        payload,
    );

    return response.data;
};

export const getKodyRulesByRepositoryId = async (
    repositoryId: string,
    directoryId?: string,
    tags?: string[],
) => {
    const rules = await authorizedFetch<Array<KodyRule>>(
        KODY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER,
        {
            params: { repositoryId, directoryId },
            next: { tags },
        },
    );

    return rules;
};

export const getAllOrganizationKodyRules = async () => {
    const rules = await authorizedFetch<Array<KodyRule>>(
        KODY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER,
    );
    return rules;
};

export const getPendingIDERules = async (params: {
    teamId: string;
    repositoryId?: string;
}) => {
    const rules = await authorizedFetch<Array<KodyRule>>(
        KODY_RULES_PATHS.PENDING_IDE_RULES,
        { params },
    );

    return rules;
};

export const getInheritedKodyRules = async (params: {
    teamId: string;
    repositoryId: string;
    directoryId?: string;
}) => {
    const rules = await authorizedFetch<{
        globalRules: KodyRule[];
        repoRules: KodyRule[];
        directoryRules: KodyRule[];
    }>(KODY_RULES_PATHS.GET_INHERITED_RULES, { params });
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

export const generateKodyRules = (
    teamId: string,
    months: number = 3,
    weeks?: number,
    days?: number,
) => {
    axiosAuthorized.post(KODY_RULES_PATHS.GENERATE_KODY_RULES, {
        teamId,
        months,
        weeks,
        days,
    });
};

export const syncIDERules = (params: {
    teamId: string;
    repositoryId: string;
}) => {
    axiosAuthorized.post(KODY_RULES_PATHS.SYNC_IDE_RULES, params);
};

export const reviewFastIDERules = async (
    payload: ReviewFastIDERulesPayload,
): Promise<ReviewFastIDERulesResponse> => {
    const response = await axiosAuthorized.post<ReviewFastIDERulesResponse>(
        KODY_RULES_PATHS.REVIEW_FAST_IDE_RULES,
        payload,
    );

    return response.data;
};

export const getKodyRuleSuggestions = async (ruleId: string) => {
    const url = `${KODY_RULES_PATHS.GET_KODY_RULE_SUGGESTIONS}?ruleId=${ruleId}`;
    const suggestions = await authorizedFetch<KodyRuleSuggestion[]>(url);
    return suggestions || [];
};
