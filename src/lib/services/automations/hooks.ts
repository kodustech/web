import { axiosAuthorized } from "src/core/utils/axios";
import { useFetch } from "src/core/utils/reactQuery";

import { AUTOMATIONS_PATHS } from ".";
import { Automations } from "./types";

export function useGetSlackWorkspace() {
    return useFetch<Automations[]>(AUTOMATIONS_PATHS.GET_WORKSPACE_ID, {
        params: { platformType: "SLACK" },
    });
}

export function useGetDiscordWorkspace() {
    return useFetch<any>(AUTOMATIONS_PATHS.GET_WORKSPACE_ID, {
        params: { platformType: "DISCORD" },
    });
}

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
