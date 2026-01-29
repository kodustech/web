import type { PullRequestExecution } from "@services/pull-requests";

export interface PullRequestExecutionGroup {
    prId: string;
    latest: PullRequestExecution;
    executions: PullRequestExecution[];
    reviewCount: number;
}
