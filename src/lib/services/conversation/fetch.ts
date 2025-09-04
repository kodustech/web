import { authorizedFetch } from "@services/fetch";
import { axiosAuthorized } from "src/core/utils/axios";

import { CONVERSATION_API } from ".";
import { Conversation } from "./types";

export const createConversation = async ({
    prompt,
    teamId,
}: {
    prompt: string;
    teamId: string;
}): Promise<{ uuid: string }> => {
    const { data } = await axiosAuthorized.post<{ data: { uuid: string } }>(
        CONVERSATION_API.CREATE_CONVERSATION,
        { prompt, teamId },
    );

    return data;
};

export const getConversations = async (
    teamId?: string,
): Promise<Record<string, Conversation[]>> => {
    try {
        const response = await authorizedFetch<Record<string, Conversation[]>>(
            CONVERSATION_API.GET_ALL_CONVERSATIONS,
        );

        return response;
    } catch (error) {
        return {}; // Retorna um objeto vazio em caso de erro
    }
};
