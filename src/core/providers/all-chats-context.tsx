"use client";

import { createContext, useContext } from "react";
import { Conversation } from "@services/conversation/types";

const AllChatsContext = createContext<{
    chats: Record<string, Conversation[]>;
}>({ chats: {} });

export const useAllChats = (): React.ContextType<typeof AllChatsContext> => {
    return useContext(AllChatsContext);
};

type AllChatsProviderProps = React.PropsWithChildren & {
    chats: React.ContextType<typeof AllChatsContext>["chats"];
};

export const AllChatsProvider = ({
    children,
    chats = {},
}: AllChatsProviderProps) => {
    return (
        <AllChatsContext.Provider value={{ chats }}>
            {children}
        </AllChatsContext.Provider>
    );
};
