import { pathToApiUrl } from "src/core/utils/helpers";

export const PERMISSIONS_PATHS = {
    PERMISSIONS: pathToApiUrl("/permissions"),
    CAN_ACCESS: pathToApiUrl("/permissions/can-access"),
    ASSIGNED_REPOS: pathToApiUrl("/permissions/assigned-repos"),
    ASSIGN_REPOS: pathToApiUrl("/permissions/assign-repos"),
};
