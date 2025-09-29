import { authorizedFetch } from "@services/fetch";
import type { OrganizationParametersConfigKey } from "@services/parameters/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { ORGANIZATION_PARAMETERS_PATHS } from ".";

export const createOrUpdateOrganizationParameter = async (
    key: string,
    configValue: any,
    organizationId: string,
) => {
    return await axiosAuthorized.post<any>(
        ORGANIZATION_PARAMETERS_PATHS.CREATE_OR_UPDATE,
        {
            key,
            configValue,
            organizationAndTeamData: { organizationId },
        },
    );
};

export const deleteBYOK = async (params: {
    configType: "main" | "fallback";
    organizationId: string;
}) => {
    return await axiosAuthorized.deleted<any>(
        ORGANIZATION_PARAMETERS_PATHS.DELETE_BYOK,
        { params },
    );
};

export const getOrganizationParameterByKey = async <
    T extends { configValue: unknown },
>(params: {
    key: OrganizationParametersConfigKey;
    organizationId: string;
}) =>
    await authorizedFetch<T | null>(ORGANIZATION_PARAMETERS_PATHS.GET_BY_KEY, {
        params,
    });
