import { pathToApiUrl } from "src/core/utils/helpers";

export const SSO_CONFIG_PATHS = {
    GET: pathToApiUrl("/sso-config"),
    CREATE_OR_UPDATE: pathToApiUrl("/sso-config"),
};
