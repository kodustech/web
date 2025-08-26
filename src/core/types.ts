import type { TeamRole, UserRole } from "@enums";

export type LiteralUnion<LiteralType extends string> =
    | LiteralType
    | (string & Record<never, never>);

export type IntegrationsCommon = {
    name: string;
    id: string;
    key?: string;
    projectType?: string;
    isPrivate?: boolean;
    isConfirmed?: boolean;
    selected: boolean;
    url?: string;
};

export interface Cookies {
    [key: string]: string | undefined;
}

export enum SeverityLevel {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
}

export enum TEAM_STATUS {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    REMOVED = "removed",
}

export interface JwtPayload {
    email: string;
    role: UserRole;
    teamRole: TeamRole;
    sub: string;
    organizationId: string;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
}

export interface ParsedJwt {
    headers: Record<string, any>;
    payload: JwtPayload;
    expired: boolean;
}

export enum IntegrationCategory {
    CODE_MANAGEMENT = "CODE_MANAGEMENT",
    PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT",
    COMMUNICATION = "COMMUNICATION",
}

export enum AuthMode {
    OAUTH = "oauth",
    TOKEN = "token",
}

export type OrganizationAndTeamData = {
    organizationId?: string;
    teamId?: string;
};

export type TODO = any;

export enum PlatformType {
    GITHUB = "GITHUB",
    GITLAB = "GITLAB",
    JIRA = "JIRA",
    SLACK = "SLACK",
    NOTION = "NOTION",
    MSTEAMS = "MSTEAMS",
    DISCORD = "DISCORD",
    AZURE_BOARDS = "AZURE_BOARDS",
    AZURE_REPOS = "AZURE_REPOS",
    BITBUCKET = "BITBUCKET",
}
