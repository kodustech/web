"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { SvgKody } from "@components/ui/icons/SvgKody";
import { Input } from "@components/ui/input";
import { Page } from "@components/ui/page";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { CONVERSATION_API } from "@services/conversation";
import { createConversation } from "@services/conversation/fetch";
import { MessageSquareText, SendHorizontal } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { transferChatFirstMessage } from "./server-actions";

export default function NewChat() {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const [prompt, setPrompt] = useState("");
    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const [sendPrompt, { loading }] = useAsyncAction(async () => {
        const response: { uuid: string } = await createConversation({
            prompt,
            teamId,
        });

        const queryKey = generateQueryKey(
            CONVERSATION_API.GET_ALL_CONVERSATIONS,
            { params: { teamId } },
        );

        await invalidateQueries({ queryKey });

        const newChatId = response.uuid;

        await transferChatFirstMessage(prompt, newChatId);

        router.push(`/chat/${newChatId}`);
    });

    return (
        <Page.Root className="justify-center">
            <Page.Header className="-mt-16">
                <div className="flex flex-row items-center gap-6">
                    <div className="aspect-square h-16 w-16 -scale-x-[1] overflow-hidden rounded-full bg-card">
                        <SvgKody className="h-full w-full" />
                    </div>

                    <div className="relative">
                        <Heading>How can I help?</Heading>

                        <div className="absolute -top-4 left-0 text-sm text-brand-red">
                            Alpha
                        </div>
                    </div>
                </div>
            </Page.Header>

            <Page.Content className="flex-none">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-5 z-[1] flex items-center text-muted-foreground">
                        <MessageSquareText />
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}>
                        <Input
                            value={prompt}
                            disabled={loading}
                            className="h-16 px-16"
                            placeholder="Chat with Kody"
                            onChange={(event) => setPrompt(event.target.value)}
                        />

                        <div className="absolute inset-y-0 right-5 z-[1] flex items-center text-muted-foreground">
                            <Button
                                loading={loading}
                                disabled={!prompt.length}
                                size="icon"
                                type="submit"
                                onClick={() => sendPrompt()}
                                variant="secondary"
                                className="aspect-square text-xs">
                                <SendHorizontal className="size-5" />
                            </Button>
                        </div>
                    </form>
                </div>
            </Page.Content>
        </Page.Root>
    );
}
