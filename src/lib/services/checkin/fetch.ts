import { axiosAuthorized } from "src/core/utils/axios";

import { CHECKIN_PATHS } from ".";

export const getCheckinSections = async () => {
    try {
        const response = await axiosAuthorized.fetcher(
            CHECKIN_PATHS.GET_SECTIONS_INFO,
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const saveCheckinConfig = async (checkinConfig: any, teamId: string) => {
    try {
        const response = await axiosAuthorized.post<any>(
            CHECKIN_PATHS.SAVE_CHECKIN_CONFIG,
            {
                checkinConfig,
                organizationAndTeamData: { teamId },
            },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};

export const getCheckinConfig = async (checkinId: string, teamId: string) => {
    try {
        const response = await axiosAuthorized.fetcher(
            CHECKIN_PATHS.GET_CHECKIN_CONFIG,
            {
                params: { checkinId, teamId },
            },
        );

        return response.data;
    } catch (error: any) {
        return { error: error.response?.status || "Erro desconhecido" };
    }
};
