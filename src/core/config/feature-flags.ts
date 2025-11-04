export const FEATURE_FLAGS = {
    tokenUsagePage: "token-usage-page",
    kodyRuleSuggestions: "kody-rules-suggestions",
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
