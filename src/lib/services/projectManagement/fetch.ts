import { IColumns, IntegrationsCommonForSetInfos } from "@services/setup/types";
import { OrganizationAndTeamData } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";

import { PROJECT_MANAGEMENT_API_PATHS } from ".";

export const createProjectManagementIntegration = (
    code: any,
    platformType: any,
    organizationAndTeamData: OrganizationAndTeamData,
) => {
    return axiosAuthorized.post(
        PROJECT_MANAGEMENT_API_PATHS.CREATE_AUTH_INTEGRATION,
        { code, platformType, organizationAndTeamData },
    );
};

export const saveProjectManagementConfigs = (
    {
        domainSelected,
        projectSelected,
        teamSelected,
        boardSelected,
    }: IntegrationsCommonForSetInfos,
    teamId: string,
) => {
    return axiosAuthorized.post(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_CONFIG_UPDATE,
        {
            domainSelected: domainSelected,
            projectSelected: projectSelected,
            teamSelected: teamSelected,
            boardSelected: boardSelected,
            teamId,
        },
    );
};

export const createOrUpdateColumnsBoardProjectManagement = (
    columns: IColumns[],
    teamId: string,
) => {
    return axiosAuthorized.post(
        PROJECT_MANAGEMENT_API_PATHS.PROJECT_MANAGEMENT_COLUMNS_UPDATE,
        {
            columns,
            teamId,
        },
    );
};
