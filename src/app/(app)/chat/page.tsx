"use client";

import { redirect } from "next/navigation";
import { Page } from "@components/ui/page";
import { useAllChats } from "src/core/providers/all-chats-context";
import { useAuth } from "src/core/providers/auth.provider";

export default function Chat() {
    const { chats } = useAllChats();
    const { isOwner, isTeamLeader } = useAuth();

    const hasChats = Object.entries(chats).some(
        ([_, chatList]) => chatList.length > 0,
    );

    if (hasChats) {
        // Redireciona para o primeiro chat disponível
        const firstChat = Object.entries(chats)
            .map(([, chatList]) => chatList)
            .find((chatList) => chatList.length > 0)
            ?.at(0);

        redirect(`/chat/${firstChat?.uuid}`);
    }

    // Caso o usuário não tenha chats
    if (isOwner || isTeamLeader) {
        // Proprietários ou líderes podem ser redirecionados para criar o primeiro chat
        redirect("/chat/new");
    }

    // Membros permanecem na página de chat
    return (
        <Page.Root>
            <Page.Content className="items-center justify-center text-center text-sm">
                Nenhum chat encontrado. Por favor, crie um chat.
            </Page.Content>
        </Page.Root>
    );
}
