import { pathToApiUrl } from "src/core/utils/helpers";

export const TEAM_MEMBERS_PATHS = {
    DELETE: pathToApiUrl("/team-members"),
} as const;
