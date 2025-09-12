import { useAuth } from "src/core/providers/auth.provider";
import { usePermissionsContext } from "src/core/providers/permissions.provider";

import { Action, ResourceType } from "./types";

export const usePermission = (
    action: Action,
    resource: ResourceType,
    repoId?: string,
): boolean => {
    const { organizationId } = useAuth();
    const permissions = usePermissionsContext();

    if (!permissions || !organizationId) {
        return false;
    }

    const resourcePermissions = permissions[resource]?.[action];

    if (!resourcePermissions) {
        return false;
    }

    const matchOrgId = resourcePermissions.organizationId === organizationId;
    const matchRepoId = repoId ? resourcePermissions.repoId === repoId : true;

    return matchOrgId && matchRepoId;
};
