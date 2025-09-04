import { authorizedFetch } from "@services/fetch";
import type { OrganizationParametersConfigKey } from "@services/parameters/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { ORGANIZATION_PARAMETERS_PATHS } from ".";

export const createOrUpdateOrganizationParameter = async (
    key: string,
    configValue: any,
    organizationId: string,
) => {
    try {
        const response = await axiosAuthorized.post<any>(
            ORGANIZATION_PARAMETERS_PATHS.CREATE_OR_UPDATE,
            {
                key,
                configValue,
                organizationAndTeamData: { organizationId },
            },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Unknown error" };
    }
};

export const getOrganizationParameterByKey = async <
    T extends { configValue: unknown },
>(params: {
    key: OrganizationParametersConfigKey;
    organizationId: string;
}) =>
    await authorizedFetch<T>(ORGANIZATION_PARAMETERS_PATHS.GET_BY_KEY, {
        params,
    });
