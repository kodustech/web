import { pathToApiUrl } from "src/core/utils/helpers";

export const DRY_RUN_PATHS = {
    EXECUTE: pathToApiUrl("/dry-run/execute"),
    GET_STATUS: pathToApiUrl("/dry-run/status"),
    SSE_EVENTS: pathToApiUrl("/dry-run/events"),
    GET: pathToApiUrl("/dry-run"),
    LIST: pathToApiUrl("/dry-run"),
};
