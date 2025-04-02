import { UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { AutomationCodeReviewConfigType } from "src/app/(app)/settings/code-review/_components/pages/types";
import { usePost, useSuspenseFetch } from "src/core/utils/reactQuery";

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
        configValue: AutomationCodeReviewConfigType | undefined;
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

export const useSuspenseGetCodeReviewLabels = () => {
    return useSuspenseFetch<
        Array<{
            type: string;
            name: string;
            description: string;
        }>
    >(PARAMETERS_PATHS.GET_CODE_REVIEW_LABELS);
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
