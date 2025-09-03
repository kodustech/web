import { authorizedFetch } from "@services/fetch";

import { AUTOMATIONS_PATHS } from ".";
import { type TeamAutomation } from "./types";

export const getAutomationsByTeamId = async (teamId: string) => {
    return authorizedFetch<TeamAutomation[]>(
        AUTOMATIONS_PATHS.LIST_ALL_AUTOMATIONS,
        {
            params: { teamId },
            next: { tags: ["team-dependent"] },
        },
    );
};
