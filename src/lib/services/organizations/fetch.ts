import { typedFetch } from "@services/fetch";

import { ORGANIZATIONS_PATHS } from ".";

export const getOrganizationId = () =>
    typedFetch<string>(ORGANIZATIONS_PATHS.ORGANIZATION_ID);

export const getOrganizationName = () =>
    typedFetch<string>(ORGANIZATIONS_PATHS.ORGANIZATION_NAME);
