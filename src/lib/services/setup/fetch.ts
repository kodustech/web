import { typedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";
import { pathToApiUrl } from "src/core/utils/helpers";

import { SETUP_PATHS } from ".";

export const createOrUpdateTeamMembers = (members: any, teamId: string) => {
    return axiosAuthorized.post(pathToApiUrl("/team-members/"), {
        members,
        teamId,
    });
};

export function getConnections(teamId: string) {
    return typedFetch<
        {
            platformName: string;
            isSetupComplete: boolean;
            hasConnection: boolean;
            category:
                | "COMMUNICATION"
                | "PROJECT_MANAGEMENT"
                | "CODE_MANAGEMENT";
            config?: { [key: string]: string };
        }[]
    >(SETUP_PATHS.CONNECTIONS, {
        params: { teamId },
    }).catch((error) => {
        console.error("Failed to fetch connections:", error);
        return [];
    });
}

export const saveOrganizationNameGithub = (organizationName: string) => {
    return axiosAuthorized.post(pathToApiUrl("/github/organization-name"), {
        organizationName,
    });
};
