import { pathToApiUrl } from "src/core/utils/helpers";

export const INTEGRATION_CONFIG = {
    GET_INTEGRATION_CONFIG_BY_CATEGORY: pathToApiUrl(
        "/integration-config/get-integration-configs-by-integration-category",
    ),
} as const;
