import { ProgrammingLanguage } from "src/core/enums/programming-language";

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
};

export type LibraryRule = {
    uuid: string;
    title: string;
    rule: string;
    why_is_this_important: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    examples: KodyRulesExample[];
    tags: string[];
    language: keyof typeof ProgrammingLanguage;
    likesCount: number | 0;
    isLiked: boolean | false;
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
