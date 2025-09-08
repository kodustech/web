"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Section } from "@components/ui/section";
import { Separator } from "@components/ui/separator";
import { Spinner } from "@components/ui/spinner";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { KODY_RULES_PATHS } from "@services/kodyRules";
import { addKodyRuleToRepositories } from "@services/kodyRules/fetch";
import {
    KodyRulesOrigin,
    KodyRulesStatus,
    type KodyRule,
    type LibraryRule,
} from "@services/kodyRules/types";
import { sendRuleFeedback, removeRuleFeedback, type FeedbackType } from "@services/ruleFeedback/fetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import type { CodeReviewRepositoryConfig } from "src/app/(app)/settings/code-review/_types";
import { useAuth } from "src/core/providers/auth.provider";
import type { LiteralUnion } from "src/core/types";
import { cn } from "src/core/utils/components";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { SelectRepositoriesDropdown } from "./dropdown";
import { ExampleSection } from "./examples";

export const KodyRuleLibraryItemModal = ({
    rule,
    repositoryId,
    directoryId,
    repositories,
}: {
    rule: LibraryRule;
    repositoryId: LiteralUnion<"global"> | undefined;
    directoryId: string | undefined;
    repositories: Array<CodeReviewRepositoryConfig>;
}) => {
    const router = useRouter();
    const { userId } = useAuth();
    const queryClient = useQueryClient();
    const [positiveCount, setPositiveCount] = useState(rule.positiveCount ?? 0);
    const [negativeCount, setNegativeCount] = useState(rule.negativeCount ?? 0);
    const [userFeedback, setUserFeedback] = useState<FeedbackType | null>(
        rule.userFeedback as FeedbackType | null
    );

    const [selectedRepositoriesIds, setSelectedRepositoriesIds] = useState<
        string[]
    >(repositoryId && !directoryId ? [repositoryId] : []);

    const [selectedDirectoriesIds, setSelectedDirectoriesIds] = useState<
        Array<{ directoryId: string; repositoryId: string }>
    >(repositoryId && directoryId ? [{ repositoryId, directoryId }] : []);

    const [addToRepositories, { loading: isAddingToRepositories }] =
        useAsyncAction(async () => {
            const newRule: KodyRule = {
                title: rule.title,
                rule: rule.rule,
                severity: rule.severity.toLowerCase() as KodyRule["severity"],
                path: "",
                examples: rule.examples,
                origin: KodyRulesOrigin.LIBRARY,
                status: KodyRulesStatus.ACTIVE,
                scope: "file",
            };

            if (directoryId) {
                const repository = repositories.find(
                    (r) => r.id === repositoryId,
                );
                const directory = repository?.directories?.find(
                    (d) => d.id === directoryId,
                );
                newRule.path = `${directory?.path.slice(1)}/*`;
            }

            const addedKodyRules = await addKodyRuleToRepositories({
                rule: newRule,
                repositoriesIds: selectedRepositoriesIds,
                directoriesIds: selectedDirectoriesIds,
            });

            await queryClient.resetQueries({
                predicate: (query) =>
                    query.queryKey[0] ===
                    KODY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER,
            });

            toast({
                variant: "success",
                title: `Rule "${rule.title}" added to selected repositories`,
                description: (
                    <ul className="list-disc pl-4">
                        {addedKodyRules.map((rule) => {
                            const repository = repositories.find(
                                (r) => r.id === rule.repositoryId,
                            );

                            const directory = repository?.directories?.find(
                                (d) => d.id === rule.directoryId,
                            );

                            const directoryFullPath = directory?.path
                                ? `${repository?.name}${directory.path}`
                                : undefined;

                            return (
                                <li key={rule.uuid}>
                                    {rule.repositoryId === "global"
                                        ? "Global"
                                        : (directoryFullPath ??
                                          repository?.name)}
                                </li>
                            );
                        })}
                    </ul>
                ),
            });

            if (repositoryId) {
                return router.push(
                    addSearchParamsToUrl(
                        `/settings/code-review/${repositoryId}/kody-rules`,
                        { directoryId },
                    ),
                );
            }

            return router.push(`/library/kody-rules`);
        });

    const badExample = rule.examples?.find(({ isCorrect }) => !isCorrect);
    const goodExample = rule.examples?.find(({ isCorrect }) => isCorrect);

    const { mutate: sendFeedback, isPending: isFeedbackActionInProgress } =
        useMutation<any, Error, FeedbackType>({
            mutationFn: async (feedback: FeedbackType) => {
                const isRemovingFeedback = userFeedback === feedback;
                
                if (isRemovingFeedback) {
                    return removeRuleFeedback(rule.uuid);
                } else {
                    return sendRuleFeedback(rule.uuid, feedback);
                }
            },
            onSuccess: (data, feedback) => {
                revalidateServerSidePath("/library/kody-rules");
                const isRemovingFeedback = userFeedback === feedback;
                const newFeedback = isRemovingFeedback ? null : feedback;
                
                if (feedback === "positive") {
                    if (isRemovingFeedback) {
                        setPositiveCount(prev => prev - 1);
                    } else {
                        setPositiveCount(prev => prev + 1);
                        if (userFeedback === "negative") {
                            setNegativeCount(prev => prev - 1);
                        }
                    }
                } else {
                    if (isRemovingFeedback) {
                        setNegativeCount(prev => prev - 1);
                    } else {
                        setNegativeCount(prev => prev + 1);
                        if (userFeedback === "positive") {
                            setPositiveCount(prev => prev - 1);
                        }
                    }
                }
                
                setUserFeedback(newFeedback);
            },
            onError: (error) => {
                console.error("Error sending feedback:", error);
            },
        });

    return (
        <Dialog
            open
            onOpenChange={() => {
                if (window.history.length === 1) {
                    router.push("/library/kody-rules");
                } else {
                    router.back();
                }
            }}>
            <DialogContent className="max-w-3xl">
                <DialogHeader className="flex-row justify-between gap-3">
                    <DialogTitle className="flex items-center gap-2">
                        {rule.title}

                        <IssueSeverityLevelBadge
                            severity={
                                rule.severity.toLowerCase() as Lowercase<
                                    typeof rule.severity
                                >
                            }
                        />
                    </DialogTitle>

                    <div className="flex items-center gap-1">
                        <Button
                            size="md"
                            variant="cancel"
                            onClick={() => sendFeedback("positive")}
                            disabled={isFeedbackActionInProgress}
                            className={cn(
                                "-my-2 gap-1.5 px-2 transition-colors",
                                userFeedback === "positive" && "bg-green-500/10 text-green-500 border-green-500/20"
                            )}
                            rightIcon={
                                isFeedbackActionInProgress ? (
                                    <Spinner className="size-2.5" />
                                ) : (
                                    <ThumbsUp className="size-3" />
                                )
                            }>
                            {positiveCount > 0 ? positiveCount : null}
                        </Button>
                        
                        <Button
                            size="md"
                            variant="cancel"
                            onClick={() => sendFeedback("negative")}
                            disabled={isFeedbackActionInProgress}
                            className={cn(
                                "-my-2 gap-1.5 px-2 transition-colors",
                                userFeedback === "negative" && "bg-red-500/10 text-red-500 border-red-500/20"
                            )}
                            rightIcon={
                                isFeedbackActionInProgress ? (
                                    <Spinner className="size-2.5" />
                                ) : (
                                    <ThumbsDown className="size-3" />
                                )
                            }>
                            {negativeCount > 0 ? negativeCount : null}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="-mx-6 overflow-auto px-6">
                    <div className="flex flex-col gap-6">
                        <Section.Root>
                            <Section.Header>
                                <Section.Title>
                                    Why is it important?
                                </Section.Title>
                            </Section.Header>

                            <Section.Content className="text-text-secondary text-sm">
                                {rule.why_is_this_important}
                            </Section.Content>
                        </Section.Root>

                        <Section.Root>
                            <Section.Header>
                                <Section.Title>Instructions</Section.Title>
                            </Section.Header>

                            <Section.Content className="text-text-secondary text-sm">
                                {rule.rule}
                            </Section.Content>
                        </Section.Root>

                        <Separator />

                        {badExample && (
                            <ExampleSection
                                language={rule.language}
                                example={badExample}
                            />
                        )}

                        {goodExample && (
                            <ExampleSection
                                language={rule.language}
                                example={goodExample}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter className="justify-between gap-8">
                    <div className="flex flex-wrap items-center justify-start gap-1">
                        {rule.tags.map((tag) => (
                            <Badge key={tag} className="h-2 px-2.5 font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-end gap-px">
                        {repositoryId && (
                            <Button
                                size="md"
                                variant="primary"
                                leftIcon={<Plus />}
                                onClick={addToRepositories}
                                loading={isAddingToRepositories}>
                                Add to my rules
                            </Button>
                        )}

                        {!repositoryId && (
                            <>
                                <Button
                                    size="md"
                                    variant="primary"
                                    leftIcon={<Plus />}
                                    className="rounded-r-none"
                                    onClick={addToRepositories}
                                    loading={isAddingToRepositories}
                                    disabled={
                                        selectedRepositoriesIds.length === 0 &&
                                        selectedDirectoriesIds.length === 0
                                    }>
                                    Add to my rules
                                </Button>

                                <SelectRepositoriesDropdown
                                    repositories={repositories}
                                    selectedRepositoriesIds={
                                        selectedRepositoriesIds
                                    }
                                    selectedDirectoriesIds={
                                        selectedDirectoriesIds
                                    }
                                    setSelectedRepositoriesIds={
                                        setSelectedRepositoriesIds
                                    }
                                    setSelectedDirectoriesIds={
                                        setSelectedDirectoriesIds
                                    }
                                />
                            </>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
