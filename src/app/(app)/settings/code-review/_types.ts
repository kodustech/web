import type { TeamAutomation } from "@services/automations/types";
import type { LanguageValue } from "@services/parameters/types";
import type { LiteralUnion } from "react-hook-form";
import type { SeverityLevel } from "src/core/types";

export type AutomationCodeReviewConfigPageProps = {
    automation: TeamAutomation;
    repositoryId: LiteralUnion<"global", string>;
    directoryId?: string;
};

export enum CodeReviewSummaryOptions {
    REPLACE = "replace",
    CONCATENATE = "concatenate",
    COMPLEMENT = "complement",
}

export enum LimitationType {
    FILE = "file",
    PR = "pr",
    SEVERITY = "severity",
}

export enum GroupingModeSuggestions {
    MINIMAL = "minimal",
    FULL = "full",
}

enum ClusteringType {
    PARENT = "parent",
    RELATED = "related",
}

type CodeReviewSummary = {
    generatePRSummary?: boolean;
    behaviourForExistingDescription?: CodeReviewSummaryOptions;
    customInstructions?: string;
};

type CodeReviewPathInstruction = {
    path: string;
    instructions: string;
    severityLevel: "low" | "medium" | "high" | "critical";
};

export type CodeReviewFormType = CodeReviewGlobalConfig & {
    language: LanguageValue;
};

export type CodeReviewOptions = Record<
    | "security"
    | "code_style"
    | "refactoring"
    | "error_handling"
    | "maintainability"
    | "potential_issues"
    | "documentation_and_comments"
    | "performance_and_optimization"
    | "kody_rules"
    | "breaking_changes",
    boolean
>;

type SuggestionControlConfig = {
    groupingMode: GroupingModeSuggestions;
    limitationType: LimitationType;
    maxSuggestions: number;
    severityLevelFilter: SeverityLevel;
    applyFiltersToKodyRules: boolean;
    severityLimits?: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
};

export enum ReviewCadenceType {
    AUTOMATIC = "automatic",
    MANUAL = "manual",
    AUTO_PAUSE = "auto_pause",
}

export type ReviewCadence = {
    type: ReviewCadenceType;
    timeWindow?: number;
    pushesToTrigger?: number;
};

export type CodeReviewGlobalConfig = {
    ignorePaths: string[];
    baseBranches: string[];
    reviewOptions: CodeReviewOptions;
    ignoredTitleKeywords: string[];
    automatedReviewActive: boolean;
    reviewCadence?: ReviewCadence;
    summary: CodeReviewSummary;
    suggestionControl?: SuggestionControlConfig;
    pullRequestApprovalActive: boolean;
    kodusConfigFileOverridesWebPreferences: boolean;
    isRequestChangesActive: boolean;
    kodyRulesGeneratorEnabled?: boolean;
};

export type CodeReviewDirectoryConfig = Omit<
    CodeReviewRepositoryConfig,
    "directories"
> & {
    path: string;
};

export type CodeReviewRepositoryConfig = CodeReviewGlobalConfig & {
    id: string;
    name: string;
    isSelected: boolean;
    directories?: CodeReviewDirectoryConfig[];
};

export type AutomationCodeReviewConfigType = {
    global: CodeReviewGlobalConfig;
    repositories: Array<CodeReviewRepositoryConfig>;
};
