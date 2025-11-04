import { ProgrammingLanguage } from "src/core/enums/programming-language";

export enum KodyRuleInheritanceOrigin {
    GLOBAL = "global",
    REPOSITORY = "repository",
    DIRECTORY = "directory",
}

export type KodyRule = {
    uuid?: string;
    status: KodyRulesStatus;
    title: string;
    rule: string;
    path: string;
    scope: "file" | "pull-request";
    severity: "low" | "medium" | "high" | "critical";
    repositoryId?: string;
    directoryId?: string;
    sourcePath?: string;
    origin: KodyRulesOrigin;
    examples: KodyRulesExample[];
    inheritance?: {
        inheritable?: boolean;
        exclude?: string[];
        include?: string[];
    };
    syncError?: string;
};

export type KodyRuleWithInheritanceDetails = KodyRule & {
    inherited?: KodyRuleInheritanceOrigin; // Internal frontend use only
    excluded?: boolean; // Internal frontend use only
};

export type LibraryRule = {
    uuid: string;
    title: string;
    rule: string;
    why_is_this_important: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    bad_example?: string;
    good_example?: string;
    examples: KodyRulesExample[];
    tags: string[];
    language: keyof typeof ProgrammingLanguage;
    buckets?: string[];
    scope?: string;
    positiveCount?: number;
    negativeCount?: number;
    userFeedback?: string | null;
    likesCount?: number;
    isLiked?: boolean;
};

type KodyRulesExample = {
    snippet: string;
    isCorrect: boolean;
};

export type FindLibraryKodyRulesFilters = {
    name?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    tags?: string[];
    language?: keyof typeof ProgrammingLanguage;
    buckets?: string[];
    uuid?: string; // Filter by specific rule ID
    page?: number;
    limit?: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

export type KodyRuleBucket = {
    slug: string;
    title: string;
    description: string;
    rulesCount: number;
};

export enum KodyRulesOrigin {
    USER = "user",
    LIBRARY = "library",
    GENERATED = "generated",
}

export enum KodyRulesStatus {
    ACTIVE = "active",
    REJECTED = "rejected",
    PENDING = "pending",
    DELETED = "deleted",
}

export type KodyRuleSuggestion = {
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
    rankScore: number;
    brokenKodyRulesIds: string[];
    priorityStatus: string;
    deliveryStatus: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    prNumber: number;
    prTitle: string;
    prUrl: string;
    repositoryId: string;
    repositoryFullName: string;
};
