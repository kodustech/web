"use client";

import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import type { KodyRule, LibraryRule } from "@services/kodyRules/types";
import { setRuleLike, type RuleLike } from "@services/ruleLike/fetch";
import { useMutation } from "@tanstack/react-query";
import { HeartIcon } from "lucide-react";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import { Button } from "../button";
import { KodyRuleLibraryItemModal } from "./library-item-modal";

const severityVariantMap = {
    Critical: "bg-danger/10 text-danger border-danger/64",
    High: "bg-warning/10 text-warning border-warning/64",
    Medium: "bg-alert/10 text-alert border-alert/64",
    Low: "bg-info/10 text-info border-info/64",
} as const satisfies Record<string, string>;

export const KodyRuleLibraryItem = ({
    rule,
    repositoryId,
    onAddRule,
    selectedRepositories,
}: {
    rule: LibraryRule;
    repositoryId?: string;
    onAddRule?: (rules: KodyRule[]) => void;
    selectedRepositories?: Array<{
        id: string;
        name: string;
        isSelected?: boolean;
    }>;
}) => {
    const { teamId } = useSelectedTeamId();
    const { userId } = useAuth();

    const [isLiked, setIsLiked] = useState(rule.isLiked);
    const [likeCount, setLikeCount] = useState(rule.likesCount ?? 0);

    const { mutate: toggleLike } = useMutation<RuleLike, Error, void>({
        mutationFn: async () => {
            return setRuleLike(rule.uuid, rule.language, !isLiked, userId);
        },
        onSuccess: (data: any) => {
            setIsLiked(data.data.liked);
            setLikeCount(data.data.count);
        },
        onError: (error) => {
            console.error("Error toggling like:", error);
        },
    });

    return (
        <Card
            key={rule.uuid}
            className="flex w-full cursor-default flex-col items-start bg-transparent">
            <div
                tabIndex={0}
                role="button"
                onKeyDown={(ev) => {
                    if (ev.code == "Space" || ev.code == "Enter") {
                        (document.activeElement as HTMLDivElement)?.click();
                    }
                }}
                className="bg-card-lv2 flex h-full w-full flex-col transition hover:brightness-120 focus-visible:brightness-120"
                onClick={(ev) => {
                    magicModal.show(() => (
                        <KodyRuleLibraryItemModal
                            key={rule.uuid}
                            rule={rule}
                            repositoryId={repositoryId}
                            teamId={teamId}
                            onAddRule={onAddRule}
                            selectedRepositories={selectedRepositories}
                        />
                    ));
                }}>
                <CardHeader className="flex-row justify-between gap-4">
                    <Heading
                        variant="h3"
                        className="line-clamp-2 flex min-h-6 items-center font-semibold">
                        {rule.title}
                    </Heading>

                    {!!rule.severity && (
                        <Badge
                            className={cn(
                                "h-fit rounded-lg border-1 px-2 text-[10px] leading-px uppercase",
                                severityVariantMap[
                                    rule.severity as typeof rule.severity
                                ],
                            )}>
                            {rule.severity}
                        </Badge>
                    )}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col">
                    <p className="text-text-secondary line-clamp-3 text-[13px]">
                        {rule.rule}
                    </p>
                </CardContent>
            </div>

            <CardFooter className="bg-card-lv2 flex w-full cursor-auto items-end justify-between gap-4 px-5 pt-2 pb-4">
                <div className="flex flex-wrap items-center gap-[3px]">
                    {rule.language && (
                        <Badge>{ProgrammingLanguage[rule.language]}</Badge>
                    )}

                    {rule.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                    ))}
                </div>

                <Button
                    size="md"
                    variant="cancel"
                    onClick={() => toggleLike()}
                    className="-mr-2 -mb-2 gap-1.5 px-2"
                    rightIcon={
                        <HeartIcon
                            className={cn(
                                "transition-colors",
                                isLiked && "fill-brand-red text-brand-red",
                            )}
                        />
                    }>
                    {likeCount === 0 ? null : likeCount}
                </Button>
            </CardFooter>
        </Card>
    );
};
