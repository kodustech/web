import { pathToApiUrl } from "src/core/utils/helpers";

export const AUTOMATIONS_PATHS = {
    GET_AUTOMATIONS: pathToApiUrl("/automation"),
    GET_WORKSPACE_ID: pathToApiUrl("/integration/worskpace-id"),
    LIST_ALL_AUTOMATIONS: pathToApiUrl("/team-automation/list-all"),
    UPDATE_TEAM_AUTOMATION_STATUS: pathToApiUrl("/team-automation/update-status"),
} as const;
