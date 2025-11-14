import { pathToApiUrl } from "src/core/utils/helpers";

export const INTEGRATION_CONFIG = {
    CREATE_UPDATE_INTEGRATION_CONFIG: pathToApiUrl(
        "/integration-config/create-or-update-config",
    ), // TODO: remove, unused
    GET_INTEGRATION_CONFIG_BY_CATEGORY: pathToApiUrl(
        "/integration-config/get-integration-configs-by-integration-category",
    ),
} as const;
