import type { TeamAutomation } from "@services/automations/types";
import type { LanguageValue } from "@services/parameters/types";
import type { DeepPartial, LiteralUnion } from "react-hook-form";
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
    behaviourForNewCommits?: BehaviourForNewCommits;
};

type CodeReviewPathInstruction = {
    path: string;
    instructions: string;
    severityLevel: "low" | "medium" | "high" | "critical";
};

export type CodeReviewFormType = FormattedCodeReviewConfig & {
    language: LanguageValue;
};

export type CodeReviewOptions = Record<string, boolean>;

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
    runOnDraft: boolean;
    codeReviewVersion?: "legacy" | "v2";
    ideRulesSyncEnabled: boolean;
};

export type CodeReviewBaseConfig = {
    id: string;
    name: string;
    isSelected: boolean;
    configs: CodeReviewGlobalConfig;
};

export type CodeReviewDirectoryConfig = CodeReviewBaseConfig & {
    path: string;
};

export type CodeReviewRepositoryConfig = CodeReviewBaseConfig & {
    directories?: CodeReviewDirectoryConfig[];
};

export type AutomationCodeReviewConfigType = CodeReviewBaseConfig & {
    repositories: CodeReviewRepositoryConfig[];
};

export enum FormattedConfigLevel {
    DEFAULT = "default", // default overrides nothing
    GLOBAL = "global", // global can override default
    REPOSITORY = "repository", // repository can override global and default
    REPOSITORY_FILE = "repository_file", // file can override global, default and repository
    DIRECTORY = "directory", // directory can override global, default, repository and repository file
    DIRECTORY_FILE = "directory_file", // directory_file overrides all
}

export interface IFormattedConfigProperty<T> {
    value: T;
    level: FormattedConfigLevel;
    overriddenValue?: T;
    overriddenLevel?: FormattedConfigLevel;
}

export type FormattedConfig<T> = {
    [P in keyof T]: NonNullable<T[P]> extends Array<any>
        ? IFormattedConfigProperty<NonNullable<T[P]>>
        : NonNullable<T[P]> extends object
          ? FormattedConfig<NonNullable<T[P]>>
          : IFormattedConfigProperty<NonNullable<T[P]>>;
};

export type FormattedCodeReviewConfig = FormattedConfig<CodeReviewGlobalConfig>;

export type FormattedCodeReviewBaseConfig = Omit<
    CodeReviewBaseConfig,
    "configs"
> & {
    configs: FormattedCodeReviewConfig;
};

export interface FormattedGlobalCodeReviewConfig
    extends Omit<AutomationCodeReviewConfigType, "configs" | "repositories"> {
    configs: FormattedCodeReviewConfig & {
        showToggleCodeReviewVersion: boolean;
    }; // TODO: remove this flag when we launch v2
    repositories: FormattedRepositoryCodeReviewConfig[];
}

export type FormattedRepositoryCodeReviewConfig = Omit<
    CodeReviewRepositoryConfig,
    "configs" | "directories"
> & {
    configs: FormattedCodeReviewConfig;
    directories: FormattedDirectoryCodeReviewConfig[];
};

export type FormattedDirectoryCodeReviewConfig = Omit<
    CodeReviewDirectoryConfig,
    "configs"
> & {
    configs: FormattedCodeReviewConfig;
};

export enum BehaviourForNewCommits {
    NONE = "none",
    REPLACE = "replace",
    CONCATENATE = "concatenate",
}
