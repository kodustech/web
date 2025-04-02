import { pathToApiUrl } from "src/core/utils/helpers";

export const ORGANIZATIONS_PATHS = {
    GET_WORKED_THEMES: pathToApiUrl("/organization/worked-themes"),
    UPDATE_INFOS: pathToApiUrl("/organization/update-infos"),
    ORGANIZATION_ID: pathToApiUrl("/integration/organization-id"),

    ORGANIZATION_NAME: pathToApiUrl("/organization/name"),
    ORGANIZATION_TENANT_NAME: pathToApiUrl("/organization/tenant-name"),
} as const;
