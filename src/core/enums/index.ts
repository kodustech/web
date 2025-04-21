export const GIT_INTEGRATIONS_KEY = {
    GITHUB: "github",
    GITLAB: "gitlab",
    BITBUCKET: "bitbucket",
    AZURE_REPOS: "azure_repos",
} as const;

export const INTEGRATIONS_KEY = {
    ...GIT_INTEGRATIONS_KEY,
    JIRA: "jira",
    AZUREBOARDS: "azure-boards",
    SLACK: "slack",
    MSTEAMS: "msteams",
    DISCORD: "discord",
} as const;

export type INTEGRATIONS_KEY =
    (typeof INTEGRATIONS_KEY)[keyof typeof INTEGRATIONS_KEY];

export type INTEGRATIONS_TYPES =
    (typeof INTEGRATIONS_TYPES)[keyof typeof INTEGRATIONS_TYPES];

export const INTEGRATIONS_TYPES = {
    PROJECT_MANAGEMENT: "projectManagement",
    CODE_MANAGEMENT: "codeManagement",
    COMMUNICATION: "communication",
} as const;

export enum TeamRole {
    TEAM_LEADER = "team_leader",
    TEAM_MEMBER = "team_member",
}

export enum AutomationsTagsEnum {
    ENSURE_BEST_PRACTICE = "Ensure Best Practice",
    IMPROVE_PRODUCTIVITY = "Improve Productivity",
    IMPROVE_DELIVERY_VISIBILITY = "Improve Delivery Visibility",
    IMPROVE_DELIVERY_RISKS = "Mitigate Delivery Risks",
}

export enum AutomationType {
    AUTOMATION_CODE_REVIEW = "AutomationCodeReview",
    AUTOMATION_DAILY_CHECKIN = "AutomationDailyCheckin",
    AUTOMATION_TEAM_PROGRESS = "AutomationTeamProgress",

    AUTOMATION_INTERACTION_MONITOR = "AutomationInteractionMonitor",
    AUTOMATION_ISSUES_DETAILS = "AutomationIssuesDetails",
    AUTOMATION_IMPROVE_TASK = "AutomationImproveTask",
    AUTOMATION_ENSURE_ASSIGNEES = "AutomationEnsureAssignees",
    AUTOMATION_COMMIT_VALIDATION = "AutomationCommitValidation",
    AUTOMATION_WIP_LIMITS = "AutomationWipLimits",
    AUTOMATION_WAITING_CONSTRAINTS = "AutomationWaitingConstraints",
    AUTOMATION_TASK_BREAKDOWN = "AutomationTaskBreakdown",
    AUTOMATION_USER_REQUESTED_BREAKDOWN = "AutomationUserRequestedBreakdown",
    AUTOMATION_RETROACTIVE_MOVEMENT = "AutomationRetroactiveMovement",
}
