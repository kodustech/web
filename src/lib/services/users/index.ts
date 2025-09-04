import { pathToApiUrl } from "src/core/utils/helpers";

export const USERS_PATHS = {
    USER_INFO: pathToApiUrl("/user/info"),
    JOIN_ORGANIZATION: pathToApiUrl("/user/join-organization"),
} as const;
