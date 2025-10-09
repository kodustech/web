import { CustomMessageConfig } from "@services/pull-request-messages/types";
import { UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type {
    AutomationCodeReviewConfigType,
    CodeReviewGlobalConfig,
    FormattedGlobalCodeReviewConfig,
} from "src/app/(app)/settings/code-review/_types";
import { useFetch, usePost, useSuspenseFetch } from "src/core/utils/reactQuery";

import { PARAMETERS_PATHS } from ".";
import { ParametersConfigKey, PlatformConfigValue } from "./types";

export const useSuspenseGetParameterPlatformConfigs = (teamId: string) => {
    return useSuspenseFetch<{
        uuid: string;
        configKey: ParametersConfigKey.PLATFORM_CONFIGS;
        configValue: PlatformConfigValue;
    }>(
        PARAMETERS_PATHS.GET_BY_KEY,
        {
            params: {
                teamId,
                key: ParametersConfigKey.PLATFORM_CONFIGS,
            },
        },
        {
            fallbackData: {
                uuid: "",
                configKey: ParametersConfigKey.PLATFORM_CONFIGS,
                configValue: {},
            },
        },
    );
};

export const useSuspenseGetCodeReviewParameter = (teamId: string) => {
    return useSuspenseFetch<{
        uuid: string;
        configKey: ParametersConfigKey.CODE_REVIEW_CONFIG;
        configValue: AutomationCodeReviewConfigType;
    }>(
        PARAMETERS_PATHS.GET_BY_KEY,
        {
            params: {
                key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                teamId,
            },
        },
        {
            fallbackData: {
                uuid: "",
                configKey: ParametersConfigKey.CODE_REVIEW_CONFIG,
                configValue: {
                    repositories: [],
                } as unknown as AutomationCodeReviewConfigType,
            },
        },
    );
};

export const useSuspenseGetFormattedCodeReviewParameter = (teamId: string) => {
    return useSuspenseFetch<{
        uuid: string;
        configKey: ParametersConfigKey.CODE_REVIEW_CONFIG;
        configValue: FormattedGlobalCodeReviewConfig;
    }>(
        PARAMETERS_PATHS.GET_CODE_REVIEW_PARAMETER,
        {
            params: {
                teamId,
            },
        },
        {
            fallbackData: {
                uuid: "",
                configKey: ParametersConfigKey.CODE_REVIEW_CONFIG,
                configValue: {
                    repositories: [],
                } as unknown as FormattedGlobalCodeReviewConfig,
            },
        },
    );
};

export const useSuspenseGetDefaultCodeReviewParameter = () => {
    return useSuspenseFetch<
        CodeReviewGlobalConfig & {
            customMessages: CustomMessageConfig;
        }
    >(PARAMETERS_PATHS.DEFAULT_CODE_REVIEW_PARAMETER);
};

export const useSuspenseGetCodeReviewLabels = (codeReviewVersion?: string) => {
    // Always send the parameter, even for legacy to be explicit
    const params = { codeReviewVersion: codeReviewVersion || "v2" };

    type Label = { type: string; name: string; description: string };

    // The endpoint returns { statusCode, data: { labels: Label[] } }
    const raw = useSuspenseFetch<{ labels?: Label[] }>(
        PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS,
        { params },
    );

    return raw?.labels ?? [];
};

export const useGetCodeReviewLabels = (codeReviewVersion?: string) => {
    // Always send the parameter, even for legacy to be explicit
    const params = {
        params: { codeReviewVersion: codeReviewVersion || "v2" },
    };

    type Label = { type: string; name: string; description: string };

    return useFetch<Array<Label>>(
        PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS,
        params,
        true,
        {
            // Some endpoints return raw arrays; others return { statusCode, data }
            // and now may return { statusCode, data: { labels: [] } }
            select: (value: any): Label[] => {
                if (Array.isArray(value)) return value as Label[];
                const data = value?.data;
                if (Array.isArray(data)) return data as Label[];
                if (Array.isArray(data?.labels)) return data.labels as Label[];
                if (Array.isArray(value?.labels))
                    return value.labels as Label[];
                return [] as Label[];
            },
        },
    );
};

export const useGetAllCodeReviewLabels = () => {
    type Label = { type: string; name: string; description: string };

    const v1Labels = useFetch<Array<Label>>(
        PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS,
        { params: { codeReviewVersion: "legacy" } },
        true,
    );

    const v2Labels = useFetch<Array<Label>>(
        PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS,
        { params: { codeReviewVersion: "v2" } },
        true,
    );

    // Remove duplicates based on type
    const uniqueLabels = new Map<string, Label>();

    const normalizeToArray = (value: unknown): Label[] => {
        if (Array.isArray(value)) return value as Label[];
        const data = (value as any)?.data;
        if (Array.isArray(data)) return data as Label[];
        if (Array.isArray(data?.labels)) return data.labels as Label[];
        if (Array.isArray((value as any)?.labels))
            return (value as any).labels as Label[];
        return [];
    };

    const v1Data = normalizeToArray(v1Labels.data as unknown);
    const v2Data = normalizeToArray(v2Labels.data as unknown);

    [...v1Data, ...v2Data].forEach((label) => {
        if (!uniqueLabels.has(label.type)) uniqueLabels.set(label.type, label);
    });

    return {
        v1: v1Labels,
        v2: v2Labels,
        isLoading: v1Labels.isLoading || v2Labels.isLoading,
        allLabels: Array.from(uniqueLabels.values()),
    };
};

export type CodeReviewV2Defaults = {
    categories: {
        bug: string;
        performance: string;
        security: string;
    };
    severity: {
        critical: string;
        high: string;
        medium: string;
        low: string;
    };
};

export const useSuspenseGetCodeReviewV2Defaults = () => {
    // This endpoint returns an envelope { statusCode, data }, and our
    // useSuspenseFetch returns the inner `data`, so we type it directly.
    return useSuspenseFetch<CodeReviewV2Defaults>(
        PARAMETERS_PATHS.LIST_CODE_REVIEW_V2_DEFAULTS,
    );
};

export const useSuspenseGetParameterByKey = <T>(
    key: string,
    teamId: string,
    config?: Parameters<
        typeof useSuspenseFetch<{
            uuid: string;
            configKey: string;
            configValue: T;
        }>
    >["2"],
) => {
    return useSuspenseFetch<{
        uuid: string;
        configKey: string;
        configValue: T;
    }>(PARAMETERS_PATHS.GET_BY_KEY, { params: { key, teamId } }, config);
};

export const useSaveParameterPlatformConfigs = (
    updater?: (oldData: any[] | undefined, newData: any) => any[],
): UseMutationResult<
    any,
    AxiosError<unknown, any>,
    {
        key: ParametersConfigKey;
        configValue: { finishOnboard: boolean };
        organizationAndTeamData: { teamId: string };
    },
    { previousData: any[] | undefined }
> => {
    return usePost<
        any[],
        {
            key: ParametersConfigKey;
            configValue: { finishOnboard: boolean };
            organizationAndTeamData: { teamId: string };
        }
    >(
        PARAMETERS_PATHS.CREATE_OR_UPDATE, // Endpoint da API
        undefined, // Dados serão passados no momento da mutação
        updater, // Atualização opcional do cache
    );
};
