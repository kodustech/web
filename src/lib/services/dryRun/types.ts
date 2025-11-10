import { SeverityLevel } from "src/core/types";

export enum DryRunStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export interface ISuggestion {
    id: string;
    relevantFile: string;
    language: string;
    suggestionContent: string;
    existingCode: string;
    improvedCode: string;
    oneSentenceSummary: string;
    relevantLinesStart: number;
    relevantLinesEnd: number;
    label: string;
    severity: string;
    rankScore?: number;
    brokenKodyRulesIds?: string[];
    clusteringInformation?: {
        type?: string;
        relatedSuggestionsIds?: string[];
        parentSuggestionId?: string;
        problemDescription?: string;
        actionStatement?: string;
    };
    priorityStatus: string;
    deliveryStatus: string;
    implementationStatus?: string;
    comment?: {
        id: number;
        pullRequestReviewId: number;
    };
    type?: string;
    createdAt: string;
    updatedAt: string;
    prNumber?: number;
    prTitle?: string;
    prUrl?: string;
    repositoryId?: string;
    repositoryFullName?: string;
}

export interface IFile {
    id: string;
    sha?: string;
    path: string;
    filename: string;
    previousName: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    suggestions: ISuggestion[];
    added?: number;
    deleted?: number;
    changes?: number;
    reviewMode?: string;
    codeReviewModelUsed?: {
        generateSuggestions: string;
        safeguard: string;
    };
}

export interface ISuggestionByPR {
    id: string;
    suggestionContent: string;
    oneSentenceSummary: string;
    label: string;
    severity?: SeverityLevel;
    brokenKodyRulesIds?: string[];
    priorityStatus?: string;
    deliveryStatus: string;
    comment?: {
        id: number;
        pullRequestReviewId: number;
    };
    files?: {
        violatedFileSha?: string[];
        relatedFileSha?: string[];
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface IDryRunData {
    id: string;
    status: DryRunStatus;

    dependents: IDryRunData["id"][]; // Ids of dry runs that reference this one
    createdAt: Date;
    updatedAt: Date;

    provider: string;
    prNumber: number;
    prTitle: string;
    repositoryId: string;
    repositoryName: string;
    directoryId?: string;

    description: string;
    messages: IDryRunMessage[];
    files: IFile[]; // Changed files or reference to another dry run
    prLevelSuggestions: ISuggestionByPR[]; // PR level suggestions or reference to another dry run

    config: string; // ID of the code review config used
    pullRequestMessages: string; // ID of the pull request messages used

    configHashes: {
        full: string; // Hash of the full config
        basic: string; // Hash of configs that do not affect LLM behavior
        llm: string; // Hash of configs that affect LLM behavior
    };
}

export interface IDryRunMessage {
    id: number;
    content: string;
    path?: string;
    lines?: {
        start: number;
        end: number;
    };
    severity?: string;
    category?: string;
    language?: string;
    existingCode?: string;
    improvedCode?: string;
}

export enum DryRunEventType {
    MESSAGE_ADDED = "MESSAGE_ADDED",
    MESSAGE_UPDATED = "MESSAGE_UPDATED",
    DESCRIPTION_UPDATED = "DESCRIPTION_UPDATED",
    STATUS_UPDATED = "STATUS_UPDATED",
    REMOVED = "REMOVED",
}

export interface IDryRunBaseEvent {
    id: string;
    dryRunId: string;
    organizationId: string;
    teamId: string;
    type: DryRunEventType;
    payload: any;
    timestamp: Date;
}

export interface IDryRunMessageAddedEvent extends IDryRunBaseEvent {
    type: DryRunEventType.MESSAGE_ADDED;
    payload: IDryRunMessageAddedPayload;
}

export interface IDryRunMessageAddedPayload {
    message: IDryRunMessage;
}

export interface IDryRunMessageUpdatedEvent extends IDryRunBaseEvent {
    type: DryRunEventType.MESSAGE_UPDATED;
    payload: IDryRunMessageUpdatedPayload;
}

export interface IDryRunMessageUpdatedPayload {
    messageId: number;
    content: string;
}

export interface IDryRunDescriptionUpdatedEvent extends IDryRunBaseEvent {
    type: DryRunEventType.DESCRIPTION_UPDATED;
    payload: IDryRunDescriptionUpdatedPayload;
}

export interface IDryRunDescriptionUpdatedPayload {
    description: string;
}

export interface IDryRunStatusUpdatedEvent extends IDryRunBaseEvent {
    type: DryRunEventType.STATUS_UPDATED;
    payload: IDryRunStatusUpdatedPayload;
}

export interface IDryRunStatusUpdatedPayload {
    status: DryRunStatus;
}

export interface IDryRunRemovedEvent extends IDryRunBaseEvent {
    type: DryRunEventType.REMOVED;
    payload: IDryRunRemovedPayload;
}

export interface IDryRunRemovedPayload {}

export type IDryRunEvent =
    | IDryRunMessageAddedEvent
    | IDryRunMessageUpdatedEvent
    | IDryRunDescriptionUpdatedEvent
    | IDryRunStatusUpdatedEvent
    | IDryRunRemovedEvent;

export type IDryRunPayloadMap = {
    [T in DryRunEventType]: Extract<IDryRunEvent, { type: T }>["payload"];
};
