import type { Repository } from "@services/codeManagement/types";
import { authorizedFetch } from "@services/fetch";
import { IntegrationCategory } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { INTEGRATION_CONFIG } from ".";
import type { IntegrationConfig } from "./types";

// TODO: remove, unused
export const createOrUpdateIntegrationConfig = async (
    integrationConfigs: Array<{ configKey: string; configValue: any }>,
    teamId: string,
    integrationCategory: IntegrationCategory,
) => {
    try {
        const response = await axiosAuthorized.post<any>(
            INTEGRATION_CONFIG.CREATE_UPDATE_INTEGRATION_CONFIG,
            {
                integrationConfigs,
                teamId,
                integrationCategory,
            },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const getIntegrationConfig = ({
    teamId,
    integrationCategory = IntegrationCategory.CODE_MANAGEMENT,
}: {
    teamId: string;
    integrationCategory?: IntegrationCategory;
}) => {
    return authorizedFetch<Array<IntegrationConfig>>(
        INTEGRATION_CONFIG.GET_INTEGRATION_CONFIG_BY_CATEGORY,
        {
            params: { teamId, integrationCategory },
        },
    ).then((r) => (r.at(0)?.configValue ?? []) as Array<Repository>);
};
