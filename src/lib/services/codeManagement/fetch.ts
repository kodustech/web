import {
    AuthMode,
    OrganizationAndTeamData,
    PlatformType,
} from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { CODE_MANAGEMENT_API_PATHS, type Repository, type RepositoryUploadResult } from "./types";

export const getRepositories = async (
    teamId: string,
    organizationSelected?: any,
) => {
    const { data }: { data: any[] } = await axiosAuthorized.fetcher(
        CODE_MANAGEMENT_API_PATHS.GET_REPOSITORIES_ORG,
        { params: { teamId, organizationSelected } },
    );

    return data;
};

export const createOrUpdateRepositories = (
    repositories: Repository[],
    teamId: string,
    type: "replace" | "append" = "replace",
) => {
    return axiosAuthorized.post(
        CODE_MANAGEMENT_API_PATHS.CREATE_OR_UPDATE_REPOSITORIES_CONFIG,
        {
            repositories,
            teamId,
            type,
        },
    );
};

export const createOrUpdateRepositoriesInChunks = async (
    repositories: Repository[],
    teamId: string,
    onProgress?: (current: number, total: number) => void
): Promise<RepositoryUploadResult> => {
    const CHUNK_SIZE = 50;
    const chunks = [];
    
    for (let i = 0; i < repositories.length; i += CHUNK_SIZE) {
        chunks.push(repositories.slice(i, i + CHUNK_SIZE));
    }
    
    const results: RepositoryUploadResult = {
        success: 0,
        failed: 0,
        errors: []
    };
    
    for (let i = 0; i < chunks.length; i++) {
        const type = i === 0 ? "replace" : "append";
        try {
            await createOrUpdateRepositories(chunks[i], teamId, type);
            results.success += chunks[i].length;
        } catch (error) {
            results.failed += chunks[i].length;
            results.errors.push(`Chunk ${i + 1} failed`);
        }
        onProgress?.(results.success + results.failed, repositories.length);
    }
    
    return results;
};

export const createCodeManagementIntegration = ({
    integrationType,
    organizationAndTeamData,
    authMode = AuthMode.OAUTH,
    installationId,
    host = "",
    code = "",
    token = "",
    username = "",
    email = "",
    orgName = "",
}: {
    integrationType: PlatformType;
    organizationAndTeamData: OrganizationAndTeamData;
    authMode?: AuthMode;
    host?: string;
    code?: any;
    installationId?: any;
    token?: string;
    username?: string;
    email?: string;
    orgName?: string;
}) => {
    const authCode = installationId || code;

    if (!token && !authCode) {
        throw new Error(
            "Either installationId or code must be provided when token is not present",
        );
    }
    return axiosAuthorized.post<{
        statusCode: number;
        data: {
            success: boolean;
            status: "SUCCESS" | "NO_ORGANIZATION" | "NO_REPOSITORIES";
        };
    }>(CODE_MANAGEMENT_API_PATHS.CREATE_AUTH_INTEGRATION, {
        code: authCode,
        integrationType,
        organizationAndTeamData,
        authMode,
        token,
        host,
        username,
        email,
        orgName,
    });
};

export const finishOnboarding = (params: {
    teamId: string;
    reviewPR: boolean;
    repositoryId?: string;
    repositoryName?: string;
    pullNumber?: number;
}) => {
    const { teamId, reviewPR, repositoryId, repositoryName, pullNumber } =
        params;
    return axiosAuthorized.post(CODE_MANAGEMENT_API_PATHS.FINISH_ONBOARDING, {
        teamId,
        reviewPR,
        repositoryId,
        repositoryName,
        pullNumber,
    });
};

export const deleteIntegration = async (
    organizationId: string,
    teamId: string,
) => {
    return axiosAuthorized.deleted<any>(
        CODE_MANAGEMENT_API_PATHS.DELETE_INTEGRATION,
        { params: { organizationId, teamId } },
    );
};

export const deleteIntegrationAndRepositories = async (
    organizationId: string,
    teamId: string,
) => {
    return axiosAuthorized.deleted<any>(
        CODE_MANAGEMENT_API_PATHS.DELETE_INTEGRATION_AND_REPOSITORIES,
        { params: { organizationId, teamId } },
    );
};
