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
    Logs = "logs",
}

export type PermissionsMap = {
    [K in ResourceType]?: {
        [A in Action]?: any;
    };
};
