import { WorkItemType } from "@services/integrations/integrationConfig/types";
import { IColumns, Select } from "@services/setup/types";
import { IntegrationsCommon } from "src/core/types";
import { useFetch, useSuspenseFetch } from "src/core/utils/reactQuery";

import { PROJECT_MANAGEMENT_API_PATHS } from ".";

export function useGetProjects(
    teamId: string,
    domainSelected?: IntegrationsCommon,
) {
    return useFetch<IntegrationsCommon[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_PROJECTS,
        { params: { teamId, domainSelected } },
        !!teamId,
    );
}

export function useSuspenseGetProjects(
    teamId: string,
    domainSelected?: IntegrationsCommon,
) {
    return useSuspenseFetch<IntegrationsCommon[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_PROJECTS,
        { params: { teamId, domainSelected } },
    );
}

export function useSuspenseGetDomains(teamId: string) {
    return useSuspenseFetch<IntegrationsCommon[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_DOMAINS,
        { params: { teamId } },
    );
}

export function useGetDomains(teamId: string) {
    return useFetch<IntegrationsCommon[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_DOMAINS,
        { params: { teamId } },
        !!teamId,
    );
}

export function useGetBoards(
    teamId: string,
    domainSelected?: IntegrationsCommon,
    projectSelected?: IntegrationsCommon,
) {
    return useFetch<any>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_BOARDS,
        { params: { teamId, domainSelected, projectSelected } },
        !!teamId,
    );
}

export function useSuspenseGetBoards(
    teamId: string,
    domainSelected?: IntegrationsCommon,
    projectSelected?: IntegrationsCommon,
) {
    return useSuspenseFetch<IntegrationsCommon[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_BOARDS,
        {
            params: {
                teamId,
                "domainSelected[name]": domainSelected?.name,
                "domainSelected[id]": domainSelected?.id,
                "domainSelected[url]": domainSelected?.url,
                "domainSelected[selected]": domainSelected?.selected,
                "projectSelected[name]": projectSelected?.name,
                "projectSelected[id]": projectSelected?.id,
                "projectSelected[key]": projectSelected?.key,
                "projectSelected[selected]": projectSelected?.selected,
            },
        },
    );
}

export function useGetColumns(teamId: string) {
    return useFetch<{
        isCreate: boolean;
        columns: IColumns[];
    }>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_COLUMNS,
        { params: { teamId } },
        !!teamId,
    );
}

export function useSuspenseGetColumns(teamId: string) {
    return useSuspenseFetch<{
        isCreate: boolean;
        columns: IColumns[];
    }>(PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_COLUMNS, {
        params: { teamId },
    });
}

export function useGetTeams(
    domainSelected?: IntegrationsCommon,
    projectSelected?: IntegrationsCommon,
) {
    return useFetch<IntegrationsCommon[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_TEAMS,
        {
            params: {
                domainSelected: domainSelected?.name,
                projectSelected: projectSelected?.id,
            },
        },
    );
}

export function useGetProjectManagementMembers() {
    return useFetch<Select[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_MEMBERS,
    );
}

export function useGetWorkItemTypes(teamId: string) {
    return useFetch<WorkItemType[]>(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_GET_WORK_ITEM_TYPES,
        { params: { teamId } },
        !!teamId,
    );
}
