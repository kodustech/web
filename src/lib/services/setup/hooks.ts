import { ORGANIZATIONS_PATHS } from "@services/organizations";
import { UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useFetch, usePost, useSuspenseFetch } from "src/core/utils/reactQuery";

import { SETUP_PATHS } from ".";
import {
    InstallationStatus,
    TeamMemberInvite,
    TeamMembersResponse,
} from "./types";

export function useGetGithubOrganizationName() {
    return useFetch<string>(SETUP_PATHS.GITHUB_ORGANIZATION_NAME);
}

export function useGetGithubIntegrationByInstallId(installId: string) {
    return useFetch<{ status: InstallationStatus; organizationName: string }>(
        SETUP_PATHS.GITHUB_INTEGRATION + `?installId=${installId}`,
    );
}

// TODO: remove, unused
export function useGetTeamMembers(teamId: string) {
    return useFetch<TeamMembersResponse>(
        SETUP_PATHS.TEAM_MEMBERS,
        { params: { teamId: teamId } },
        !!teamId,
    );
}

export const useCreateOrUpdateTeamMembers = (
    updater?: (oldData: any[] | undefined, newData: any) => any[],
): UseMutationResult<
    any,
    AxiosError<unknown, any>,
    { members: TeamMemberInvite[]; teamId: string },
    { previousData: any[] | undefined }
> => {
    return usePost<any[], { members: TeamMemberInvite[]; teamId: string }>(
        SETUP_PATHS.TEAM_MEMBERS,
        undefined,
        updater,
    );
};

export function useSuspenseGetConnections(teamId: string) {
    return useSuspenseFetch<
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
    });
}

export function useSuspenseGetOrganizationId() {
    return useSuspenseFetch<string>(ORGANIZATIONS_PATHS.ORGANIZATION_ID);
}

// TODO: remove, unused
export function useVerifyConnectionCommunication() {
    return useFetch<any>(SETUP_PATHS.VERIFY_CONNECTION_COMMUNICATION);
}
