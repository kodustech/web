import { pathToApiUrl } from "src/core/utils/helpers";

export const TEAMS_PATHS = {
    LIST_ALL: pathToApiUrl("/team"),
    LIST_WITH_INTEGRATIONS: pathToApiUrl("/team/list-with-integrations"),
    UPDATE: pathToApiUrl("/team"),
    CREATE: pathToApiUrl("/team"),
    DELETE: pathToApiUrl("/team"),
    GET_TEAM_BY_ID: pathToApiUrl("/team/get-by-id"),
    FIRST_CREATED_TEAM: pathToApiUrl("/team/first-created"),
    FINISH_SETUP_TEAM: pathToApiUrl("/team/finish-setup"),

} as const;
