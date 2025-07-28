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
import { addKodyRuleToRepositories } from "@services/kodyRules/fetch";
import {
    KodyRulesOrigin,
    KodyRulesStatus,
    type KodyRule,
    type LibraryRule,
} from "@services/kodyRules/types";
import { setRuleLike } from "@services/ruleLike/fetch";
import type { RuleLike } from "@services/ruleLike/types";
import { useMutation } from "@tanstack/react-query";
import { HeartIcon, Plus } from "lucide-react";
import type { LiteralUnion } from "react-hook-form";
import { useAuth } from "src/core/providers/auth.provider";
import { cn } from "src/core/utils/components";
import {
    revalidateServerSidePath,
    revalidateServerSideTag,
} from "src/core/utils/revalidate-server-side";

import { SelectRepositoriesDropdown } from "./dropdown";
import { ExampleSection } from "./examples";

export const KodyRuleLibraryItemModal = ({
    rule,
    repositoryId,
    repositories,
}: {
    rule: LibraryRule;
    repositoryId: LiteralUnion<"global", string> | undefined;
    repositories: Array<{
        id: string;
        name: string;
        isSelected?: boolean;
    }>;
}) => {
    const router = useRouter();
    const { userId } = useAuth();

    const [selectedRepositoriesIds, setSelectedRepositoriesIds] = useState<
        string[]
    >(repositoryId ? [repositoryId] : []);

    const [isLiked, setIsLiked] = useState(rule.isLiked);
    const [likeCount, setLikeCount] = useState(rule.likesCount ?? 0);

    const [addToRepositories, { loading: isAddingToRepositories }] =
        useAsyncAction(async () => {
            const newRule = {
                title: rule.title,
                rule: rule.rule,
                severity: rule.severity.toLowerCase() as KodyRule["severity"],
                path: "",
                examples: rule.examples,
                origin: KodyRulesOrigin.LIBRARY,
                status: KodyRulesStatus.ACTIVE,
            };

            const addedKodyRules = await addKodyRuleToRepositories(
                selectedRepositoriesIds,
                newRule,
            );

            revalidateServerSideTag("kody-rules-list");

            toast({
                variant: "success",
                title: `Rule "${rule.title}" added to selected repositories`,
                description: (
                    <ul className="list-disc pl-4">
                        {addedKodyRules.map((r) => (
                            <li key={r.uuid}>
                                {r.repositoryId === "global"
                                    ? "Global"
                                    : repositories?.find(
                                          (cr) => cr.id === r.repositoryId,
                                      )?.name}
                            </li>
                        ))}
                    </ul>
                ),
            });

            if (repositoryId) {
                return router.push(
                    `/settings/code-review/${repositoryId}/kody-rules`,
                );
            }

            return router.push(`/library/kody-rules`);
        });

    const badExample = rule.examples?.find(({ isCorrect }) => !isCorrect);
    const goodExample = rule.examples?.find(({ isCorrect }) => isCorrect);

    const { mutate: toggleLike, isPending: isLikeActionInProgress } =
        useMutation<RuleLike, Error, void>({
            mutationFn: async () => {
                return setRuleLike(rule.uuid, rule.language, !isLiked, userId);
            },
            onSuccess: (data: any) => {
                revalidateServerSidePath("/library/kody-rules");
                setIsLiked(data.data.liked);
                setLikeCount(data.data.count);
            },
            onError: (error) => {
                console.error("Error toggling like:", error);
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

                    <Button
                        size="md"
                        variant="cancel"
                        onClick={() => toggleLike()}
                        className="-my-2 gap-1.5 px-2"
                        rightIcon={
                            isLikeActionInProgress ? (
                                <Spinner className="text-brand-red size-2.5" />
                            ) : (
                                <HeartIcon
                                    className={cn(
                                        "transition-colors",
                                        isLiked &&
                                            "fill-brand-red text-brand-red",
                                    )}
                                />
                            )
                        }>
                        {likeCount === 0 ? null : likeCount}
                    </Button>
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
                            <Badge
                                key={tag}
                                className="pointer-events-none h-2 px-2.5 font-normal">
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
                                        selectedRepositoriesIds.length === 0
                                    }>
                                    Add to my rules
                                </Button>

                                <SelectRepositoriesDropdown
                                    selectedRepositories={repositories ?? []}
                                    selectedRepositoriesIds={
                                        selectedRepositoriesIds
                                    }
                                    setSelectedRepositoriesIds={
                                        setSelectedRepositoriesIds
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
