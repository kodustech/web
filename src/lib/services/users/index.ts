import { pathToApiUrl } from "src/core/utils/helpers";

export const USERS_PATHS = {
    USER_INFO: pathToApiUrl("/user/info"), // TODO: remove, unused
    JOIN_ORGANIZATION: pathToApiUrl("/user/join-organization"),
} as const;
