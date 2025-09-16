import { UserRole } from "@enums";

export enum Action {
    Manage = "manage", // wildcard for any action
    Create = "create",
    Read = "read",
    Update = "update",
    Delete = "delete",
}

export enum ResourceType {
    All = "all",
    PullRequests = "pull_requests",
    Issues = "issues",
    Cockpit = "cockpit",
    Billing = "billing",
    CodeReviewSettings = "code_review_settings",
    GitSettings = "git_settings",
    UserSettings = "user_settings",
    OrganizationSettings = "organization_settings",
    PluginSettings = "plugin_settings",
    Logs = "logs",
}

export type PermissionsMap = {
    [K in ResourceType]?: {
        [A in Action]?: {
            organizationId: string;
            repoId?: string[];
        };
    };
};

export const rolePriority = {
    [UserRole.OWNER]: 1,
    [UserRole.REPO_ADMIN]: 2,
    [UserRole.BILLING_MANAGER]: 3,
    [UserRole.CONTRIBUTOR]: 4,
} as const;
