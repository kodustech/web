import { pathToApiUrl } from "src/core/utils/helpers";

export const CONVERSATION_API = {
    GET_ALL_CONVERSATIONS: pathToApiUrl("/conversation"),
    GET_CONVERSATION_BY_ID: (conversationId: string) =>
        pathToApiUrl(`/conversation/${conversationId}`),
    NEW_MESSAGE_TO_CONVERSATION_BY_ID: (conversationId: string) =>
        pathToApiUrl(`/conversation/${conversationId}/message`),
    CREATE_CONVERSATION: pathToApiUrl("/conversation"),
} as const;
