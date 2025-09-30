import { axiosAuthorized } from "src/core/utils/axios";

import { AUTOMATIONS_PATHS } from ".";

export const updateTeamAutomationStatus = (
    teamAutomationId: string,
    status: boolean,
) => {
    return axiosAuthorized.post(
        AUTOMATIONS_PATHS.UPDATE_TEAM_AUTOMATION_STATUS,
        {
            teamAutomationId,
            status,
        },
    );
};
