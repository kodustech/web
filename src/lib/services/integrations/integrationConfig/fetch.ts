import { IntegrationCategory } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { INTEGRATION_CONFIG } from ".";

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
