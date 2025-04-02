import { typedFetch } from "@services/fetch";

import { AUTOMATIONS_PATHS } from ".";
import { type TeamAutomation } from "./types";

export const getAutomationsByTeamId = async (teamId: string) => {
    return typedFetch<TeamAutomation[]>(
        AUTOMATIONS_PATHS.LIST_ALL_AUTOMATIONS,
        {
            params: { teamId },
            next: { tags: ["team-dependent"] },
        },
    );
};
