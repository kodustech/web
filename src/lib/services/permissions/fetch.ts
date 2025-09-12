import { authorizedFetch } from "@services/fetch";

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

export const getAssignedRepos = async () => {
    const response = await authorizedFetch<string[]>(
        PERMISSIONS_PATHS.ASSIGNED_REPOS,
    );

    return response;
};
