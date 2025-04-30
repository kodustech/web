import { pathToApiUrl } from "src/core/utils/helpers";

export const RULE_LIKE_PATHS = {
    ALL: pathToApiUrl("/rule-like/all"),
    SET_LIKE: (ruleId: string) => pathToApiUrl(`/rule-like/${ruleId}`),
    COUNT: (ruleId: string) => pathToApiUrl(`/rule-like/${ruleId}/count`),
    FIND: pathToApiUrl("/rule-like"),
    ALL_RULES_WITH_LIKES: pathToApiUrl(`/rule-like/all-rules-with-likes`),
} as const;
