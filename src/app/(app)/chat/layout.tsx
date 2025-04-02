"use client";

import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";
import { useSuspenseGetConversations } from "@services/conversation/hooks";
import { AllChatsProvider } from "src/core/providers/all-chats-context";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { ChatSidebar } from "./_components/sidebar";

export default function Layout({ children }: React.PropsWithChildren) {
    const { teamId } = useSelectedTeamId();
    const chats = useSuspenseGetConversations(teamId);

    return (
        <AllChatsProvider chats={chats}>
            <div className="flex flex-1 flex-row overflow-hidden">
                <ChatSidebar />

                <Separator orientation="vertical" />

                <Page.WithSidebar>{children}</Page.WithSidebar>
            </div>
        </AllChatsProvider>
    );
}
