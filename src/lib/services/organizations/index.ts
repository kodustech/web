import { pathToApiUrl } from "src/core/utils/helpers";

export const ORGANIZATIONS_PATHS = {
    UPDATE_INFOS: pathToApiUrl("/organization/update-infos"),
    ORGANIZATION_ID: pathToApiUrl("/integration/organization-id"),

    ORGANIZATION_NAME: pathToApiUrl("/organization/name"),
} as const;
