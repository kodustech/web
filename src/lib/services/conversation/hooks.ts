import { UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useFetch, usePost, useSuspenseFetch } from "src/core/utils/reactQuery";

import { CONVERSATION_API } from ".";
import type { Conversation } from "./types";

export const useConversationMessages = (conversationId: string) => {
    return useFetch<Conversation>(
        CONVERSATION_API.GET_CONVERSATION_BY_ID(conversationId),
        undefined,
        true,
        {
            staleTime: 1000 * 60 * 5, // 5 minutos
            retry: false,
        },
    );
};

export const useSuspenseGetConversations = (teamId: string) => {
    return useSuspenseFetch<Record<string, Conversation[]>>(
        CONVERSATION_API.GET_ALL_CONVERSATIONS,
        { params: { teamId } },
    );
};

export const useSendMessage = (
    conversationId: string,
    updater?: (oldData: any[] | undefined, newData: any) => any[],
): UseMutationResult<
    any,
    AxiosError<unknown, any>,
    any,
    { previousData: any[] | undefined }
> => {
    return usePost<any[], any>(
        CONVERSATION_API.NEW_MESSAGE_TO_CONVERSATION_BY_ID(conversationId),
        undefined,
        updater,
    );
};
