import { typedFetch } from "@services/fetch";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { axiosAuthorized } from "src/core/utils/axios";

import { RULE_LIKE_PATHS } from ".";
import { RuleLike } from "./types";

export const getAllRuleLikes = () =>
    typedFetch<RuleLike[]>(RULE_LIKE_PATHS.ALL);

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

export const getRuleLikeCount = (ruleId: string) =>
    typedFetch<number>(RULE_LIKE_PATHS.COUNT(ruleId));

export const findRuleLikes = (params: {
    ruleId?: string;
    language?: (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage];
    userId?: string;
}) => typedFetch<RuleLike[]>(RULE_LIKE_PATHS.FIND, { params });

export const getAllRulesWithLikes = async () => {
    const rules = await typedFetch<RuleLike[]>(
        RULE_LIKE_PATHS.ALL_RULES_WITH_LIKES,
    );

    return rules;
};
export type { RuleLike };
