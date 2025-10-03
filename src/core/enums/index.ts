export const GIT_INTEGRATIONS_KEY = {
    GITHUB: "github",
    GITLAB: "gitlab",
    BITBUCKET: "bitbucket",
    AZURE_REPOS: "azure_repos",
} as const;

export const INTEGRATIONS_KEY = {
    ...GIT_INTEGRATIONS_KEY,
} as const;

export type INTEGRATIONS_KEY =
    (typeof INTEGRATIONS_KEY)[keyof typeof INTEGRATIONS_KEY];

export type INTEGRATIONS_TYPES =
    (typeof INTEGRATIONS_TYPES)[keyof typeof INTEGRATIONS_TYPES];

export const INTEGRATIONS_TYPES = {
    CODE_MANAGEMENT: "codeManagement",
} as const;

export enum TeamRole {
    TEAM_LEADER = "team_leader",
    TEAM_MEMBER = "team_member",
}

export enum UserRole {
    OWNER = "owner",
    BILLING_MANAGER = "billing_manager",
    REPO_ADMIN = "repo_admin",
    CONTRIBUTOR = "contributor",
}

export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    EMAIL_PENDING = "pending_email",
    AWAITING_APPROVAL = "awaiting_approval",
    REMOVED = "removed",
}

export enum AutomationsTagsEnum {
    ENSURE_BEST_PRACTICE = "Ensure Best Practice",
    IMPROVE_PRODUCTIVITY = "Improve Productivity",
    IMPROVE_DELIVERY_VISIBILITY = "Improve Delivery Visibility",
    IMPROVE_DELIVERY_RISKS = "Mitigate Delivery Risks",
}

export enum AutomationType {
    AUTOMATION_CODE_REVIEW = "AutomationCodeReview",
}
