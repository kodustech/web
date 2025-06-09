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

export function getConnectionsOnClient(teamId: string) {
    return axiosAuthorized
        .fetcher(SETUP_PATHS.CONNECTIONS, {
            params: { teamId },
        })
        .then((r) => r.data)
        .catch((error) => {
            console.error("Failed to fetch connections:", error);
            return [];
        }) as Promise<
        Array<{
            platformName: string;
            isSetupComplete: boolean;
            hasConnection: boolean;
            category:
                | "COMMUNICATION"
                | "PROJECT_MANAGEMENT"
                | "CODE_MANAGEMENT";
            config?: { [key: string]: string };
        }>
    >;
}

export function getConnections(teamId: string) {
    return typedFetch(SETUP_PATHS.CONNECTIONS, {
        params: { teamId },
    }).catch((error) => {
        console.error("Failed to fetch connections:", error);
        return [];
    }) as Promise<
        Array<{
            platformName: string;
            isSetupComplete: boolean;
            hasConnection: boolean;
            category:
                | "COMMUNICATION"
                | "PROJECT_MANAGEMENT"
                | "CODE_MANAGEMENT";
            config?: { [key: string]: string };
        }>
    >;
}

export const saveOrganizationNameGithub = (organizationName: string) => {
    return axiosAuthorized.post(pathToApiUrl("/github/organization-name"), {
        organizationName,
    });
};
