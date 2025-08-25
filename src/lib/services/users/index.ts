import { pathToApiUrl } from "src/core/utils/helpers";

export const USERS_PATHS = {
    JOIN_ORGANIZATION: pathToApiUrl("/user/join-organization"),
} as const;
