import { INTEGRATIONS_KEY, TeamRole } from "@enums";
import { IntegrationsCommon } from "src/core/types";

export type IntegrationsCommonForSetInfos = {
    domainSelected?: IntegrationsCommon;
    projectSelected?: IntegrationsCommon;
    teamSelected?: IntegrationsCommon;
    boardSelected?: IntegrationsCommon;
};

export enum STATUS {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    REMOVED = "removed",
}

export type MembersSetup = {
    uuid?: string;
    isCreate?: boolean;
    active: boolean;
    avatar?: string;
    communicationId?: string;
    name: string;
    teamRole?: TeamRole.TEAM_LEADER | TeamRole.TEAM_MEMBER;
    communication: { name: string; id: string };
    email: string;
    error: boolean;
    isCurrentUser?: boolean;
    userStatus?: string;
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
