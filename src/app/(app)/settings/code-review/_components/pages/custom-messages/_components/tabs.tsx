"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Page } from "@components/ui/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import {
    savePullRequestMessages,
    type getPullRequestMessages,
} from "@services/pull-request-messages/fetch";
import { SaveIcon } from "lucide-react";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

import type { AutomationCodeReviewConfigPageProps } from "../../types";
import { TabContent } from "./tab-content";

type PullRequestMessages = NonNullable<
    Awaited<ReturnType<typeof getPullRequestMessages>>
>;

export const CustomMessagesTabs = (props: {
    messages: PullRequestMessages;
    repositoryId: AutomationCodeReviewConfigPageProps["repositoryId"];
}) => {
    const [messages, setMessages] = useState<
        Pick<PullRequestMessages, "endReviewMessage" | "startReviewMessage">
    >({
        startReviewMessage: props.messages.startReviewMessage,
        endReviewMessage: props.messages.endReviewMessage,
    });

    const wasStartReviewMessageChanged =
        messages.startReviewMessage.status !==
            props.messages.startReviewMessage.status ||
        messages.startReviewMessage.content !==
            props.messages.startReviewMessage.content;

    const isStartReviewMessageValid =
        messages.startReviewMessage.content.trim().length > 0;

    const wasEndReviewMessageChanged =
        messages.endReviewMessage.status !==
            props.messages.endReviewMessage.status ||
        messages.endReviewMessage.content !==
            props.messages.endReviewMessage.content;

    const isEndReviewMessageValid =
        messages.endReviewMessage.content.trim().length > 0;

    const [action, { loading: isSaving }] = useAsyncAction(async () => {
        try {
            await savePullRequestMessages({
                uuid: props.messages.uuid,
                repositoryId: props.repositoryId,
                startReviewMessage: messages.startReviewMessage,
                endReviewMessage: messages.endReviewMessage,
            });

            await revalidateServerSidePath(
                "/settings/code-review/global/custom-messages",
            );

            toast({
                title: "Custom messages saved",
                variant: "success",
            });
        } catch (error) {
            console.error("Error saving custom messages:", error);

            toast({
                title: "Failed to save custom messages",
                description: "Please try again later.",
                variant: "warning",
            });
        }
    });

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>Custom Messages</Page.Title>

                <Page.HeaderActions>
                    <Button
                        size="md"
                        variant="primary"
                        loading={isSaving}
                        leftIcon={<SaveIcon />}
                        onClick={() => action()}
                        disabled={
                            !wasStartReviewMessageChanged &&
                            !wasEndReviewMessageChanged
                        }>
                        Save changes
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content>
                <Tabs defaultValue="start-review-message" className="flex-1">
                    <TabsList>
                        <TabsTrigger value="start-review-message">
                            Start Review message
                            {wasStartReviewMessageChanged && (
                                <span className="text-tertiary-light">*</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="end-review-message">
                            End Review message
                            {wasEndReviewMessageChanged && (
                                <span className="text-tertiary-light">*</span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        forceMount
                        className="flex-1"
                        value="start-review-message">
                        <TabContent
                            type="startReviewMessage"
                            value={messages.startReviewMessage}
                            onChange={(startReviewMessage) => {
                                setMessages((prev) => ({
                                    ...prev,
                                    startReviewMessage,
                                }));
                            }}
                        />
                    </TabsContent>

                    <TabsContent
                        forceMount
                        className="flex-1"
                        value="end-review-message">
                        <TabContent
                            type="endReviewMessage"
                            value={messages.endReviewMessage}
                            onChange={(endReviewMessage) => {
                                setMessages((prev) => ({
                                    ...prev,
                                    endReviewMessage,
                                }));
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </Page.Content>
        </Page.Root>
    );
};
