import { authorizedFetch } from "@services/fetch";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { axiosAuthorized } from "src/core/utils/axios";

import { RULE_LIKE_PATHS } from ".";
import { RuleLike } from "./types";

// TODO: remove, unused
export const getAllRuleLikes = () =>
    authorizedFetch<RuleLike[]>(RULE_LIKE_PATHS.ALL);

// TODO: remove, unused
export const setRuleLike = (
    ruleId: string,
    language: (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage],
    liked: boolean,
    userId?: string,
) =>
    axiosAuthorized.post<RuleLike>(RULE_LIKE_PATHS.SET_LIKE(ruleId), {
        language,
        liked,
        userId,
    });

// TODO: remove, unused
export const getRuleLikeCount = (ruleId: string) =>
    authorizedFetch<number>(RULE_LIKE_PATHS.COUNT(ruleId));

// TODO: remove, unused
export const findRuleLikes = (params: {
    ruleId?: string;
    language?: (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage];
    userId?: string;
}) => authorizedFetch<RuleLike[]>(RULE_LIKE_PATHS.FIND, { params });

// TODO: remove, unused
export const getAllRulesWithLikes = async () => {
    const rules = await authorizedFetch<RuleLike[]>(
        RULE_LIKE_PATHS.ALL_RULES_WITH_LIKES,
    );

    return rules;
};
export type { RuleLike };
