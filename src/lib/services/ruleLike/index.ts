import { pathToApiUrl } from "src/core/utils/helpers";

export const RULE_LIKE_PATHS = {
    ALL: pathToApiUrl("/rule-like/all"), // TODO: remove, unused
    SET_LIKE: (ruleId: string) => pathToApiUrl(`/rule-like/${ruleId}`), // TODO: remove, unused
    COUNT: (ruleId: string) => pathToApiUrl(`/rule-like/${ruleId}/count`), // TODO: remove, unused
    FIND: pathToApiUrl("/rule-like"), // TODO: remove, unused
    ALL_RULES_WITH_LIKES: pathToApiUrl(`/rule-like/all-rules-with-likes`), // TODO: remove, unused
} as const;
