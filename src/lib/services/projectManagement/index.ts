import { pathToApiUrl } from "src/core/utils/helpers";

export const PROJECT_MANAGEMENT_API_PATHS = {
    CREATE_AUTH_INTEGRATION: pathToApiUrl(
        "/project-management/auth-integration",
    ),
    PROJECT_MANAGEMENT_COLUMNS: pathToApiUrl("/project-management/columns"),
    PROJECT_MANAGEMENT_DOMAINS: pathToApiUrl("/project-management/domains"),
    PROJECT_MANAGEMENT_PROJECTS: pathToApiUrl("/project-management/projects"),
    PROJECT_MANAGEMENT_TEAMS: pathToApiUrl("/project-management/teams"),
    PROJECT_MANAGEMENT_BOARDS: pathToApiUrl("/project-management/boards"),
    PROJECT_MANAGEMENT_MEMBERS: pathToApiUrl(
        "/project-management/list-members",
    ),

    PROJECT_MANAGEMENT_CONFIG_UPDATE: pathToApiUrl(
        "/project-management/config",
    ),

    PROJECT_MANAGEMENT_COLUMNS_UPDATE: pathToApiUrl(
        "/project-management/columns",
    ),
    PROJECT_MANAGEMENT_GET_EPICS: pathToApiUrl("/project-management/epics"),
    PROJECT_MANAGEMENT_GET_TEAM_EFFORTS: pathToApiUrl(
        "/project-management/team-effort",
    ),
    PROJECT_MANAGEMENT_UPDATE_INTEGRATION_CONFIG: pathToApiUrl(
        "/project-management/create-or-update-integration-config",
    ),

    PROJECT_MANAGEMENT_GET_WORK_ITEM_TYPES: pathToApiUrl(
        "/project-management/work-item-types",
    ),
} as const;
