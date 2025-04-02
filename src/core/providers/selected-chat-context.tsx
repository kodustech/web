"use client";

import { createContext, useContext, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next/client";

import { useAllChats } from "./all-chats-context";

const COOKIE_KEY = "chatId";

const SelectedChatContext = createContext<{
    chatId: string | undefined;
    setChatId: (teamId: string) => void;
    clearChatId: () => void;
}>({
    chatId: undefined,
    setChatId: () => { },
    clearChatId: () => { },
});

export const useSelectedChatId = (): React.ContextType<
    typeof SelectedChatContext
> => {
    const { chats } = useAllChats();

    const context = useContext(SelectedChatContext);
    let chatId = context.chatId;

    if (!context.chatId || !chats.find((team: any) => team.id === chatId)) {
        chatId = chats?.at(0)?.id;
    }

    return { ...context, chatId };
};


export const SelectedChatProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [chatId, _setChatId] = useState<string | undefined>(
        getCookie(COOKIE_KEY),
    );

    return (
        <SelectedChatContext.Provider
            value={{
                chatId: chatId,
                setChatId: (teamId) => {
                    _setChatId(teamId);
                    setCookie(COOKIE_KEY, teamId);
                },
                clearChatId: () => {
                    _setChatId(undefined);
                    deleteCookie(COOKIE_KEY);
                },
            }}>
            {children}
        </SelectedChatContext.Provider>
    );
};
