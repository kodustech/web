import { pathToApiUrl } from "src/core/utils/helpers";

export const CHECKIN_PATHS = {
    GET_CHECKIN: pathToApiUrl("/checkin"),
    GET_SECTIONS_INFO: pathToApiUrl("/checkin/sections-info"),
    SAVE_CHECKIN_CONFIG: pathToApiUrl("/checkin/save-configs"),
    GET_CHECKIN_CONFIG: pathToApiUrl("/checkin/get-configs"),
} as const;
