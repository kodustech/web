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
        CodeReviewGlobalConfig &
            Omit<CustomMessageConfig, "uuid" | "repositoryId" | "directoryId">
    >(PARAMETERS_PATHS.DEFAULT_CODE_REVIEW_PARAMETER);
};

export const useSuspenseGetCodeReviewLabels = (codeReviewVersion?: string) => {
    // Always send the parameter, even for legacy to be explicit
    const params = { codeReviewVersion: codeReviewVersion || "v2" };

    return useSuspenseFetch<
        Array<{
            type: string;
            name: string;
            description: string;
        }>
    >(PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS, {
        params,
    });
};

export const useGetCodeReviewLabels = (codeReviewVersion?: string) => {
    // Always send the parameter, even for legacy to be explicit
    const params = {
        params: { codeReviewVersion: codeReviewVersion || "v2" },
    };

    return useFetch<
        Array<{
            type: string;
            name: string;
            description: string;
        }>
    >(PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS, params, true);
};

export const useGetAllCodeReviewLabels = () => {
    const v1Labels = useFetch<
        Array<{
            type: string;
            name: string;
            description: string;
        }>
    >(
        PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS,
        { params: { codeReviewVersion: "legacy" } },
        true,
    );

    const v2Labels = useFetch<
        Array<{
            type: string;
            name: string;
            description: string;
        }>
    >(
        PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS,
        { params: { codeReviewVersion: "v2" } },
        true,
    );

    // Remove duplicates based on type
    const uniqueLabels = new Map();
    [...(v1Labels.data || []), ...(v2Labels.data || [])].forEach((label) => {
        if (!uniqueLabels.has(label.type)) {
            uniqueLabels.set(label.type, label);
        }
    });

    return {
        v1: v1Labels,
        v2: v2Labels,
        isLoading: v1Labels.isLoading || v2Labels.isLoading,
        allLabels: Array.from(uniqueLabels.values()),
    };
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
