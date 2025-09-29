import { authorizedFetch } from "@services/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import { OrganizationParametersConfigKey } from "@services/parameters/types";
import { axiosAuthorized } from "src/core/utils/axios";
import type { BYOKConfig } from "src/features/ee/byok/_types";

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

export const getBYOK = async () => {
    const organizationId = await getOrganizationId();

    const byokConfig = await getOrganizationParameterByKey<{
        configValue: { main: BYOKConfig; fallback: BYOKConfig };
    }>({
        key: OrganizationParametersConfigKey.BYOK_CONFIG,
        organizationId,
    });

    return byokConfig?.configValue;
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
