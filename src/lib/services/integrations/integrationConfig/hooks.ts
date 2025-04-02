import { IntegrationCategory } from "src/core/types";
import { useFetch } from "src/core/utils/reactQuery";

import { INTEGRATION_CONFIG } from ".";
import { IntegrationConfig } from "./types";

export function getIntegrationConfigsByCategory(
    teamId: string,
    integrationCategory: IntegrationCategory,
) {
    const { data, isLoading } = useFetch<IntegrationConfig[]>(
        INTEGRATION_CONFIG.GET_INTEGRATION_CONFIG_BY_CATEGORY,
        { params: { teamId, integrationCategory } },
        !!teamId,
    );

    return { data: data && data?.length > 0 ? data : [], isLoading };
}
