"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@components/ui/sidebar";
import { Plus } from "lucide-react";
import { useAllChats } from "src/core/providers/all-chats-context";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { formatPeriodLabel } from "src/core/utils/helpers";

export const ChatSidebar = () => {
    const { teamId } = useSelectedTeamId();
    const { chats } = useAllChats();
    const pathname = usePathname();

    const displayedChats = useMemo(() => {
        // Certifique-se de que "chats" é um objeto válido
        if (!chats || typeof chats !== "object") return {};

        let filteredChats = Object.entries(chats).reduce(
            (acc, [period, chatList]) => {
                if (Array.isArray(chatList) && chatList.length > 0) {
                    acc[period] = chatList;
                }
                return acc;
            },
            {} as Record<string, any[]>,
        );

        // Se o usuário estiver na página de novo chat, adiciona um grupo com nome vazio para informar que ele está criando uma nova conversa
        if (pathname === "/chat/new") {
            filteredChats = {
                "": [
                    {
                        uuid: "new",
                        title: "New Conversation",
                    },
                ],
                ...filteredChats,
            };
        }

        return filteredChats;
    }, [chats, teamId, pathname]);

    return (
        <div className="h-full overflow-auto">
            <Sidebar>
                <SidebarContent className="overflow-visible">
                    <Link href="/chat/new" legacyBehavior>
                        <Badge
                            variant="ghost"
                            rightIcon={<Plus />}
                            className="flex-shrink-0 self-end text-xs">
                            New chat
                        </Badge>
                    </Link>

                    <SidebarGroup>
                        {Object.entries(displayedChats).map(
                            ([period, chats], index) => {
                                const label = formatPeriodLabel(period);

                                return (
                                    <div
                                        key={`${period}-${index}`}
                                        className="mb-6">
                                        {/* Label do período */}
                                        {label && (
                                            <>
                                                <SidebarGroupLabel>
                                                    {formatPeriodLabel(period)}
                                                </SidebarGroupLabel>
                                                <Separator className="mb-2" />
                                            </>
                                        )}

                                        {/* Lista de conversas */}
                                        <SidebarGroupContent className="flex flex-col gap-1">
                                            {chats.map(
                                                ({ uuid: id, title }) => (
                                                    <Link
                                                        passHref
                                                        key={id}
                                                        href={`/chat/${id}`}>
                                                        <Button
                                                            size="sm"
                                                            className="w-full justify-start"
                                                            variant={
                                                                pathname.startsWith(
                                                                    `/chat/${id}`,
                                                                )
                                                                    ? "default"
                                                                    : "ghost"
                                                            }>
                                                            {title}
                                                        </Button>
                                                    </Link>
                                                ),
                                            )}
                                        </SidebarGroupContent>
                                    </div>
                                );
                            },
                        )}
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </div>
    );
};
