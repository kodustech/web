export interface Author {
    id: string;
    username: string;
    name: string;
}

export interface AutomationExecution {
    uuid: string;
    status: "success" | "error" | "in_progress" | "pending";
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
    origin: string;
}

export interface CodeReviewTimelineItem {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    status: "in_progress" | "success" | "error";
    message: string;
}

export interface PullRequestExecution {
    prId: string;
    prNumber: number;
    title: string;
    status: "open" | "closed" | "merged";
    merged: boolean;
    url: string;
    baseBranchRef: string;
    headBranchRef: string;
    repositoryName: string;
    repositoryId: string;
    openedAt: string;
    closedAt: string;
    createdAt: string;
    updatedAt: string;
    provider: "GITHUB" | "GITLAB" | "BITBUCKET" | "AZURE_REPOS";
    author: Author;
    isDraft: boolean;
    automationExecution: AutomationExecution | null;
    codeReviewTimeline: CodeReviewTimelineItem[];
    enrichedData: Record<string, any>;
}

export interface PullRequestExecutionsResponse {
    data: PullRequestExecution[];
    statusCode: number;
    type: "Array";
}
