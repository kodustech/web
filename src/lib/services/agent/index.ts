import { pathToApiUrl } from "src/core/utils/helpers";

export const AGENT_PATHS = {
    EXECUTE_AGENT: pathToApiUrl("/agent/execute-agent"),
} as const;
