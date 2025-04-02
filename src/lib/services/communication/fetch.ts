import { IntegrationsCommon, OrganizationAndTeamData } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { COMMUNICATION_PATHS, DISCORD_API_PATHS, SLACK_API_PATHS } from ".";

export const saveChannelConfigs = async (
    teamId: string,
    channelSelected?: any,
    isPrivate?: boolean,
    isConfirmedButton: boolean = false,
) => {
    return axiosAuthorized.post<any>(COMMUNICATION_PATHS.SAVE_CHANNEL, {
        channelSelected,
        teamId,
        isPrivate,
        isConfirmedButton,
    });
};

export const postSlackAuthIntegration = (
    code: string,
    organizationAndTeamData: OrganizationAndTeamData,
) => {
    return axiosAuthorized.post(SLACK_API_PATHS.POST_SLACK_OATH, {
        code,
        organizationAndTeamData,
    });
};

export const postDiscordAuthIntegration = (
    code: string,
    organizationAndTeamData: OrganizationAndTeamData,
) => {
    return axiosAuthorized.post(DISCORD_API_PATHS.POST_DISCORD_OATH, {
        code,
        organizationAndTeamData,
    });
};
