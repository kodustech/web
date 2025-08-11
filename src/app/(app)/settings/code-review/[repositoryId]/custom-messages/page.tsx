"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Page } from "@components/ui/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { savePullRequestMessages } from "@services/pull-request-messages/fetch";
import { useSuspensePullRequestMessages } from "@services/pull-request-messages/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";

import { CodeReviewPagesBreadcrumb } from "../../_components/breadcrumb";
import { useCodeReviewRouteParams } from "../../_hooks";
import { TabContent } from "./_components/tab-content";

export default function CustomMessages() {
    const pullRequestMessages = useSuspensePullRequestMessages();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const queryClient = useQueryClient();

    const [messages, setMessages] = useState<
        Pick<
            typeof pullRequestMessages,
            "endReviewMessage" | "startReviewMessage"
        >
    >({
        startReviewMessage: pullRequestMessages.startReviewMessage,
        endReviewMessage: pullRequestMessages.endReviewMessage,
    });

    const wasStartReviewMessageChanged =
        messages.startReviewMessage.status !==
            pullRequestMessages.startReviewMessage.status ||
        messages.startReviewMessage.content !==
            pullRequestMessages.startReviewMessage.content;

    const isStartReviewMessageValid =
        messages.startReviewMessage.content.trim().length > 0;

    const wasEndReviewMessageChanged =
        messages.endReviewMessage.status !==
            pullRequestMessages.endReviewMessage.status ||
        messages.endReviewMessage.content !==
            pullRequestMessages.endReviewMessage.content;

    const isEndReviewMessageValid =
        messages.endReviewMessage.content.trim().length > 0;

    const [action, { loading: isSaving }] = useAsyncAction(async () => {
        try {
            await savePullRequestMessages({
                uuid: pullRequestMessages.uuid,
                repositoryId,
                directoryId,
                startReviewMessage: messages.startReviewMessage,
                endReviewMessage: messages.endReviewMessage,
            });

            await queryClient.resetQueries({
                predicate: (query) =>
                    (query.queryKey[0] as string)?.startsWith(
                        "/pull-request-messages",
                    ),
            });

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
                <CodeReviewPagesBreadcrumb pageName="Custom messages" />
            </Page.Header>

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
}
