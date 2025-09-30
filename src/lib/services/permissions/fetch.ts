import { authorizedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";

import { PERMISSIONS_PATHS } from ".";
import { Action, PermissionsMap, ResourceType } from "./types";

export const getPermissions = async () => {
    const response = await authorizedFetch<PermissionsMap>(
        PERMISSIONS_PATHS.PERMISSIONS,
    );

    return response;
};

export const canAccess = async (resource: ResourceType, action: Action) => {
    const response = await authorizedFetch<{ canAccess: boolean }>(
        PERMISSIONS_PATHS.CAN_ACCESS,
        {
            params: { resource, action },
        },
    );

    return response;
};

export const getAssignedRepos = async (userId: string) => {
    const response = await authorizedFetch<string[]>(
        PERMISSIONS_PATHS.ASSIGNED_REPOS,
        { params: { userId } },
    );

    return response;
};

export const assignRepos = async (
    repositoryIds: string[],
    userId: string,
    teamId: string,
) => {
    const reponse = await axiosAuthorized.post<string[]>(
        PERMISSIONS_PATHS.ASSIGN_REPOS,
        { repositoryIds, userId, teamId },
    );

    return reponse;
};
