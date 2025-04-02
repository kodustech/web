import { pathToApiUrl } from "src/core/utils/helpers";

export const ORGANIZATION_PARAMETERS_PATHS = {
    CREATE_OR_UPDATE: pathToApiUrl("/organization-parameters/create-or-update"),
    GET_BY_KEY: pathToApiUrl("/organization-parameters/find-by-key"),
};
