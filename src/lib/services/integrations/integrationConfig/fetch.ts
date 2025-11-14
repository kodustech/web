import type { Repository } from "@services/codeManagement/types";
import { authorizedFetch } from "@services/fetch";
import { IntegrationCategory } from "src/core/types";

import { INTEGRATION_CONFIG } from ".";
import type { IntegrationConfig } from "./types";

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
