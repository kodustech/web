import { pathToApiUrl } from "src/core/utils/helpers";

export const TOKEN_USAGE_PATHS = {
    GET_SUMMARY: pathToApiUrl("/usage/tokens/summary"),
    GET_DAILY: pathToApiUrl("/usage/tokens/daily"),
    GET_BY_PR: pathToApiUrl("/usage/tokens/by-pr"),
    GET_DAILY_BY_PR: pathToApiUrl("/usage/tokens/daily-by-pr"),
    GET_BY_DEVELOPER: pathToApiUrl("/usage/tokens/by-developer"),
    GET_DAILY_BY_DEVELOPER: pathToApiUrl("/usage/tokens/daily-by-developer"),
};
