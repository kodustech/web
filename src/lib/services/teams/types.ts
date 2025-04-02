import { TEAM_STATUS } from "src/core/types";

export type Team = {
    uuid: string;
    name: string;
    status: TEAM_STATUS;
};

export interface TeamWithIntegrations {
    uuid: string;
    name: string;
    organization: Organization;
    status: string;
    hasCodeManagement: boolean;
    hasProjectManagement: boolean;
    hasCommunication: boolean;
    isCodeManagementConfigured: boolean;
    isProjectManagementConfigured: boolean;
    isCommunicationConfigured: boolean;
}

interface Organization {
    uuid: string;
    name: string;
    tenantName: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}
