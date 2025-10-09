"use client";

import { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import { Page } from "@components/ui/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { savePullRequestMessages } from "@services/pull-request-messages/fetch";
import { useSuspensePullRequestMessages } from "@services/pull-request-messages/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { pathToApiUrl, unformatConfig } from "src/core/utils/helpers";

import { CodeReviewPagesBreadcrumb } from "../../_components/breadcrumb";
import { useCodeReviewRouteParams } from "../../../_hooks";
import { GlobalSettings } from "./_components/global-settings";
import { TabContent } from "./_components/tab-content";

export default function CustomMessages() {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const pullRequestMessages = useSuspensePullRequestMessages();
    const queryClient = useQueryClient();
    const initialState = { ...pullRequestMessages };

    const canEdit = usePermission(
        Action.Update,
        ResourceType.CodeReviewSettings,
        repositoryId,
    );

    const [messages, setMessages] = useState<
        Pick<
            typeof pullRequestMessages,
            "endReviewMessage" | "startReviewMessage"
        >
    >({
        startReviewMessage: pullRequestMessages.startReviewMessage,
        endReviewMessage: pullRequestMessages.endReviewMessage,
    });

    const [globalSettings, setGlobalSettings] = useState({
        hideComments: pullRequestMessages.globalSettings?.hideComments,
    });

    useEffect(() => {
        setMessages({
            startReviewMessage: pullRequestMessages.startReviewMessage,
            endReviewMessage: pullRequestMessages.endReviewMessage,
        });
        setGlobalSettings({
            hideComments: pullRequestMessages.globalSettings?.hideComments,
        });
    }, [pullRequestMessages]);

    const wasStartReviewMessageChanged =
        messages.startReviewMessage.status.value !==
            pullRequestMessages.startReviewMessage.status.value ||
        messages.startReviewMessage.content.value !==
            pullRequestMessages.startReviewMessage.content.value;

    const wasEndReviewMessageChanged =
        messages.endReviewMessage.status.value !==
            pullRequestMessages.endReviewMessage.status.value ||
        messages.endReviewMessage.content.value !==
            pullRequestMessages.endReviewMessage.content.value;

    const wasGlobalSettingsChanged =
        globalSettings.hideComments.value !==
        (pullRequestMessages.globalSettings?.hideComments.value ?? false);

    const [action, { loading: isSaving }] = useAsyncAction(async () => {
        try {
            const unformattedMessages = unformatConfig(messages);
            const unformattedGlobalSettings = unformatConfig(globalSettings);

            await savePullRequestMessages({
                uuid: pullRequestMessages.uuid,
                repositoryId,
                directoryId,
                startReviewMessage: unformattedMessages.startReviewMessage,
                endReviewMessage: unformattedMessages.endReviewMessage,
                globalSettings: unformattedGlobalSettings,
            });

            await queryClient.invalidateQueries({
                predicate: (query) =>
                    (query.queryKey[0] as string)?.startsWith(
                        pathToApiUrl("/pull-request-messages"),
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
                            !canEdit ||
                            (!wasStartReviewMessageChanged &&
                                !wasEndReviewMessageChanged &&
                                !wasGlobalSettingsChanged)
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
                        <TabsTrigger value="global-settings">
                            Global Settings
                            {wasGlobalSettingsChanged && (
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
                            initialState={initialState.startReviewMessage}
                            onChangeAction={(startReviewMessage) => {
                                setMessages((prev) => ({
                                    ...prev,
                                    startReviewMessage: {
                                        content: {
                                            ...prev.startReviewMessage.content,
                                            value: startReviewMessage.content,
                                        },
                                        status: {
                                            ...prev.startReviewMessage.status,
                                            value: startReviewMessage.status,
                                        },
                                    },
                                }));
                            }}
                            canEdit={canEdit}
                        />
                    </TabsContent>

                    <TabsContent
                        forceMount
                        className="flex-1"
                        value="end-review-message">
                        <TabContent
                            type="endReviewMessage"
                            value={messages.endReviewMessage}
                            initialState={initialState.endReviewMessage}
                            onChangeAction={(endReviewMessage) => {
                                setMessages((prev) => ({
                                    ...prev,
                                    endReviewMessage: {
                                        content: {
                                            ...prev.endReviewMessage.content,
                                            value: endReviewMessage.content,
                                        },
                                        status: {
                                            ...prev.endReviewMessage.status,
                                            value: endReviewMessage.status,
                                        },
                                    },
                                }));
                            }}
                            canEdit={canEdit}
                        />
                    </TabsContent>

                    <TabsContent
                        forceMount
                        className="flex-1"
                        value="global-settings">
                        <GlobalSettings
                            hideComments={globalSettings.hideComments}
                            initialState={
                                initialState.globalSettings.hideComments
                            }
                            onHideCommentsChangeAction={(value) => {
                                setGlobalSettings((prev) => ({
                                    ...prev,
                                    hideComments: {
                                        ...prev.hideComments,
                                        value,
                                    },
                                }));
                            }}
                            canEdit={canEdit}
                        />
                    </TabsContent>
                </Tabs>
            </Page.Content>
        </Page.Root>
    );
}
