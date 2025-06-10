import {
    AuthMode,
    OrganizationAndTeamData,
    PlatformType,
} from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { CODE_MANAGEMENT_API_PATHS, type Repository } from "./types";

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

export const reviewOnboardingPullRequest = async (
    teamId: string,
    payload: {
        id: string;
        pull_number: number;
        repository: string;
    },
) => {
    return await axiosAuthorized.post(
        CODE_MANAGEMENT_API_PATHS.REVIEW_ONBOARDING_PULL_REQUEST,
        { teamId, payload },
    );
};

export const createOrUpdateRepositories = (
    repositories: Repository[],
    teamId: string,
) => {
    return axiosAuthorized.post(
        CODE_MANAGEMENT_API_PATHS.CREATE_OR_UPDATE_REPOSITORIES_CONFIG,
        {
            repositories,
            teamId,
        },
    );
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
        orgName,
    });
};

export const saveCodeManagementConfigs = (
    organizationSelected: any,
    teamId: string,
) => {
    return axiosAuthorized.post(
        CODE_MANAGEMENT_API_PATHS.CODE_MANAGEMENT_CONFIG_UPDATE,
        {
            organizationSelected,
            teamId,
        },
    );
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
