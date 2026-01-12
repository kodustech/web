import { pathToApiUrl } from "src/core/utils/helpers";

export const CLI_KEYS_PATHS = {
    BASE: (teamId: string) => pathToApiUrl(`/teams/${teamId}/cli-keys`),
    ITEM: (teamId: string, keyId: string) =>
        pathToApiUrl(`/teams/${teamId}/cli-keys/${keyId}`),
} as const;
