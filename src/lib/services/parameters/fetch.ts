import { typedFetch } from "@services/fetch";
import type { CodeReviewRepositoryConfig } from "src/app/(app)/settings/code-review/_types";
import type { LiteralUnion } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { codeReviewConfigRemovePropertiesNotInType } from "src/core/utils/helpers";

import { PARAMETERS_PATHS } from ".";
import type { ParametersConfigKey } from "./types";

export const getTeamParameters = async <
    T extends { configValue: unknown },
>(params: {
    key: ParametersConfigKey;
    teamId: string;
}) =>
    typedFetch<T>(PARAMETERS_PATHS.GET_BY_KEY, {
        params,
        next: { tags: ["team-dependent"] },
    });

export const getParameterByKey = async (key: string, teamId: string) => {
    try {
        const response = await axiosAuthorized.fetcher(
            PARAMETERS_PATHS.GET_BY_KEY,
            { params: { key, teamId } },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const createOrUpdateParameter = async (
    key: string,
    configValue: any,
    teamId: string,
) => {
    try {
        const response = await axiosAuthorized.post<any>(
            PARAMETERS_PATHS.CREATE_OR_UPDATE,
            {
                key,
                configValue,
                organizationAndTeamData: { teamId },
            },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const createOrUpdateCodeReviewParameter = async (
    configValue: Partial<CodeReviewRepositoryConfig>,
    teamId: string,
    repositoryId: LiteralUnion<"global"> | undefined,
    directoryId?: string,
) => {
    try {
        const trimmedCodeReviewConfigValue =
            codeReviewConfigRemovePropertiesNotInType(configValue);

        const response = await axiosAuthorized.post<any>(
            PARAMETERS_PATHS.CREATE_OR_UPDATE_CODE_REVIEW_PARAMETER,
            {
                configValue: trimmedCodeReviewConfigValue,
                organizationAndTeamData: { teamId },
                repositoryId:
                    repositoryId === "global" ? undefined : repositoryId,
                directoryId,
            },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const updateCodeReviewParameterRepositories = async (teamId: string) => {
    try {
        const response = await axiosAuthorized.post<any>(
            PARAMETERS_PATHS.UPDATE_CODE_REVIEW_PARAMETER_REPOSITORIES,
            { organizationAndTeamData: { teamId } },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const getGenerateKodusConfigFile = async (
    teamId: string,
    repositoryId?: string,
) => {
    try {
        const response = await axiosAuthorized.fetcher<any>(
            PARAMETERS_PATHS.GENERATE_KODUS_CONFIG_FILE,
            { params: { teamId, repositoryId } },
        );

        return response;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const copyCodeReviewParameter = async (params: {
    teamId: string;
    sourceRepositoryId: string;
    targetRepositoryId: string;
    targetDirectoryPath: string | undefined;
}) => {
    try {
        const response = await axiosAuthorized.post<any>(
            PARAMETERS_PATHS.COPY_CODE_REVIEW_PARAMETER,
            params,
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const generateCodeReviewParameter = async (
    teamId: string,
    repositoryId: string,
) => {
    try {
        const response = await axiosAuthorized.post<any>(
            PARAMETERS_PATHS.GENERATE_CODE_REVIEW_PARAMETER,
            { teamId, repositoryId },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const deleteRepositoryCodeReviewParameter = async ({
    repositoryId,
    teamId,
    directoryId,
}: {
    teamId: string;
    repositoryId: string;
    directoryId?: string;
}) => {
    try {
        const response = await axiosAuthorized.post<any>(
            PARAMETERS_PATHS.DELETE_REPOSITORY_CODE_REVIEW_PARAMETER,
            { teamId, repositoryId, directoryId },
        );

        return response.data;
    } catch (error: any) {
        throw error; // Re-throw para ser capturado no modal
    }
};
