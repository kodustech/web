import type { TeamAutomation } from "@services/automations/types";
import type { LiteralUnion } from "react-hook-form";
import type { SeverityLevel } from "src/core/types";

export type AutomationCodeReviewConfigPageProps = {
    automation: TeamAutomation;
    repositoryId: LiteralUnion<"global", string>;
};

export enum CodeReviewSummaryOptions {
    REPLACE = "replace",
    CONCATENATE = "concatenate",
    COMPLEMENT = "complement",
}

export enum LimitationType {
    FILE = "file",
    PR = "pr",
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
};

export type CodeReviewGlobalConfig = {
    ignorePaths: string[];
    baseBranches: string[];
    reviewOptions: CodeReviewOptions;
    ignoredTitleKeywords: string[];
    automatedReviewActive: boolean;
    summary: CodeReviewSummary;
    suggestionControl?: SuggestionControlConfig;
    pullRequestApprovalActive: boolean;
    kodusConfigFileOverridesWebPreferences: boolean;
    isRequestChangesActive: boolean;
    kodyRulesGeneratorEnabled?: boolean;
};

export type CodeReviewRepositoryConfig = CodeReviewGlobalConfig & {
    id: string;
    name: string;
    isSelected: boolean;
};

export type AutomationCodeReviewConfigType = {
    global: CodeReviewGlobalConfig;
    repositories: Array<CodeReviewRepositoryConfig>;
};
