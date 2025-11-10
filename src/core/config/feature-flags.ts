export const FEATURE_FLAGS = {
    tokenUsagePage: "token-usage-page",
    kodyRuleSuggestions: "kody-rules-suggestions",
    codeReviewDryRun: "code-review-dry-run",
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
