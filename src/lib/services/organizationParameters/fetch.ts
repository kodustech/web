import { authorizedFetch } from "@services/fetch";
import { getOrganizationId } from "@services/organizations/fetch";
import {
    OrganizationParametersConfigKey,
    type CockpitMetricsVisibility,
    type OrganizationParametersAutoAssignConfig,
} from "@services/parameters/types";
import { axiosAuthorized } from "src/core/utils/axios";
import type { BYOKConfig } from "src/features/ee/byok/_types";

import { ORGANIZATION_PARAMETERS_PATHS } from ".";

export const createOrUpdateOrganizationParameter = async (
    key: string,
    configValue: any,
    organizationId: string,
    teamId?: string,
) => {
    const organizationAndTeamData = teamId
        ? { organizationId, teamId }
        : { organizationId };

    return await axiosAuthorized.post<any>(
        ORGANIZATION_PARAMETERS_PATHS.CREATE_OR_UPDATE,
        {
            key,
            configValue,
            organizationAndTeamData,
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

export const getAutoLicenseAssignmentConfig = async () => {
    const organizationId = await getOrganizationId();

    const config = await getOrganizationParameterByKey<{
        configValue: OrganizationParametersAutoAssignConfig;
    }>({
        key: OrganizationParametersConfigKey.AUTO_LICENSE_ASSIGNMENT,
        organizationId,
    });

    return config?.configValue;
};

export const deleteBYOK = async (params: {
    configType: "main" | "fallback";
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

const DEFAULT_COCKPIT_METRICS_VISIBILITY: CockpitMetricsVisibility = {
    summary: {
        deployFrequency: true,
        prCycleTime: true,
        kodySuggestions: true,
        bugRatio: true,
        prSize: true,
    },
    details: {
        leadTimeBreakdown: true,
        prCycleTime: true,
        prsOpenedVsClosed: true,
        prsMergedByDeveloper: true,
        teamActivity: true,
    },
};

export const getCockpitMetricsVisibility = async (params: {
    organizationId: string;
}): Promise<CockpitMetricsVisibility> => {
    const response = await authorizedFetch<CockpitMetricsVisibility>(
        ORGANIZATION_PARAMETERS_PATHS.GET_COCKPIT_METRICS_VISIBILITY,
        { params },
    );

    return response ?? DEFAULT_COCKPIT_METRICS_VISIBILITY;
};

export const updateCockpitMetricsVisibility = async (params: {
    organizationId: string;
    teamId?: string;
    config: CockpitMetricsVisibility;
}) => {
    return await axiosAuthorized.post(
        ORGANIZATION_PARAMETERS_PATHS.UPDATE_COCKPIT_METRICS_VISIBILITY,
        params,
    );
};

export const updateAutoLicenseAllowedUsers = async (params: {
    organizationId?: string;
    teamId?: string;
    includeCurrentUser?: boolean;
}) => {
    return await axiosAuthorized.post(
        ORGANIZATION_PARAMETERS_PATHS.UPDATE_AUTO_LICENSE_ALLOWED_USERS,
        params,
    );
};
