"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@components/ui/button";
import { ChatKodyMessage } from "@components/ui/chat/kody";
import { ChatMessageList } from "@components/ui/chat/list";
import { ChatUserMessage } from "@components/ui/chat/user";
import { Icons } from "@components/ui/icons";
import { Input } from "@components/ui/input";
import { Markdown } from "@components/ui/markdown";
import { Page } from "@components/ui/page";
import { useEffectOnce } from "@hooks/use-effect-once";
import {
    useConversationMessages,
    useSendMessage,
} from "@services/conversation/hooks";
import { type Conversation } from "@services/conversation/types";
import { MessageSquareText, SendHorizontal } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { deleteChatFirstMessage } from "./server-actions";

export const PageComponent = ({
    firstMessage,
    chatId,
}: {
    firstMessage: string | undefined;
    chatId: string;
}) => {
    const { teamId } = useSelectedTeamId();

    // Busca as mensagens da conversa
    const {
        data: conversation,
        isLoading,
        isError,
        refetch,
    } = useConversationMessages(chatId);

    const ref = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        ref.current?.scrollTo({
            top: ref.current.scrollHeight,
            behavior: "smooth",
        });
    };

    // Mutação para enviar novas mensagens
    const sendMessageMutation = useSendMessage(chatId, (oldData, newData) => {
        // Verifica se oldData é undefined e inicializa como array vazio se necessário
        const existingData = oldData ?? [];
        return [...existingData, newData];
    });

    const messages = useMemo<Conversation["messages"]>(() => {
        const conversationMessages = [...(conversation?.messages ?? [])];
        if (sendMessageMutation.variables && sendMessageMutation.isPending) {
            conversationMessages.push({
                type: "human",
                data: {
                    content: sendMessageMutation.variables?.message,
                },
            });
        }

        return conversationMessages;
    }, [
        conversation?.messages,
        sendMessageMutation.isPending,
        sendMessageMutation.variables,
    ]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Estado para nova mensagem
    const [newMessage, setNewMessage] = useState(firstMessage ?? "");

    useEffectOnce(() => {
        if (firstMessage) handleSendMessage();
    });

    const handleSendMessage = async () => {
        if (!newMessage) return;
        if (firstMessage) await deleteChatFirstMessage(chatId);

        sendMessageMutation.mutate(
            { message: newMessage, teamId },
            {
                onSuccess: () => {
                    setNewMessage("");
                    refetch();
                },
            },
        );
    };

    if (isError) {
        return <div>Error loading messages.</div>;
    }

    return (
        <Page.Root scrollable={false} className="py-0">
            {isLoading ? (
                <div className="flex flex-1 items-center justify-center gap-6">
                    <Icons.spinner className="animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading</p>
                </div>
            ) : (
                <>
                    <div
                        ref={ref}
                        className="flex w-full flex-1 flex-col overflow-auto">
                        <Page.Content className="overflow-visible pt-10">
                            {messages.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center">
                                    <p className="text-sm text-muted-foreground">
                                        There are no messages yet
                                    </p>
                                </div>
                            ) : (
                                <ChatMessageList>
                                    {messages.map((message, index) => (
                                        <Fragment key={index}>
                                            {message.type === "human" ? (
                                                <ChatUserMessage>
                                                    {message?.data?.content}
                                                </ChatUserMessage>
                                            ) : (
                                                <ChatKodyMessage>
                                                    <Markdown>
                                                        {message?.data?.content}
                                                    </Markdown>
                                                </ChatKodyMessage>
                                            )}
                                        </Fragment>
                                    ))}

                                    {messages.at(-1)?.type === "human" && (
                                        <ChatKodyMessage loading />
                                    )}
                                </ChatMessageList>
                            )}
                        </Page.Content>
                    </div>

                    <Page.Footer className="mb-8">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-5 z-1 flex items-center text-muted-foreground">
                                <MessageSquareText />
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}>
                                <Input
                                    value={newMessage}
                                    disabled={sendMessageMutation.isPending}
                                    className="h-16 px-16"
                                    placeholder="Chat with Kody"
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                />

                                <div className="absolute inset-y-0 right-5 z-1 flex items-center text-muted-foreground">
                                    <Button
                                        size="icon"
                                        type="submit"
                                        onClick={handleSendMessage}
                                        disabled={
                                            !newMessage ||
                                            sendMessageMutation.isPending ||
                                            isLoading
                                        }
                                        variant="secondary"
                                        className="aspect-square text-xs">
                                        <SendHorizontal className="size-5" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Page.Footer>
                </>
            )}
        </Page.Root>
    );
};
