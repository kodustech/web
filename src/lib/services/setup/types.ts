import { INTEGRATIONS_KEY, TeamRole, type UserStatus } from "@enums";
import { IntegrationsCommon } from "src/core/types";

export type IntegrationsCommonForSetInfos = {
    domainSelected?: IntegrationsCommon;
    projectSelected?: IntegrationsCommon;
    teamSelected?: IntegrationsCommon;
    boardSelected?: IntegrationsCommon;
};

export type MembersSetup = {
    uuid?: string;
    isCreate?: boolean;
    active: boolean;
    avatar?: string;
    name: string;
    teamRole?: TeamRole;
    email: string;
    error: boolean;
    isCurrentUser?: boolean;
    userStatus?: UserStatus;
    userId?: string;
};

export type TeamMembersResponse = {
    isCreate: boolean;
    members: MembersSetup[];
};

export interface IColumns {
    name: string;
    id: string;
    column: "todo" | "wip" | "done";
    wipName?: string;
    order?: number;
}

export type Select = { name: string; id: string };

export type Communication = {
    realName: string;
    communicationId: string;
    name: string;
    avatar: string;
    email: string;
};

export type PlatformNames =
    (typeof INTEGRATIONS_KEY)[keyof typeof INTEGRATIONS_KEY];

export type Platforms = {
    codeManagement: PlatformNames;
    projectManagement: PlatformNames;
    communication: PlatformNames;
};

export enum InstallationStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
}

export interface TeamMemberInvite {
    email: string;
}
