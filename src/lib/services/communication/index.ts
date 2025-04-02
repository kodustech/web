import {
    pathToApiUrl,
    pathToDiscordApiUrl,
    pathToSlackApiUrl,
} from "src/core/utils/helpers";

export const COMMUNICATION_PATHS = {
    GET_CHANNELS: pathToApiUrl("/communication/channels"),
    SAVE_CHANNEL: pathToApiUrl("/communication/save-channel"),
    COMMUNICATION_MEMBERS: pathToApiUrl("/communication/list-members"),
};

export const SLACK_API_PATHS = {
    POST_SLACK_OATH: pathToSlackApiUrl("/api/slack-oauth-redirect"),
} as const;

export const DISCORD_API_PATHS = {
    POST_DISCORD_OATH: pathToDiscordApiUrl("/api/auth/redirect"),
} as const;
