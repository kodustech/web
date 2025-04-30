"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@components/ui/badge";
import { CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { magicModal } from "@components/ui/magic-modal";
import type { KodyRule, LibraryRule } from "@services/kodyRules/types";
import {
    findRuleLikes,
    getAllRulesWithLikes,
    getRuleLikeCount,
    setRuleLike,
    type RuleLike,
} from "@services/ruleLike/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import { Button } from "../button";
import { LikeButton } from "../like-button";
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
    const queryClient = useQueryClient();

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
        <Button
            size={null}
            variant="helper"
            key={rule.uuid}
            className="flex w-full flex-col items-start gap-2"
            onClick={(e) => {
                e.stopPropagation();
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

                <Badge
                    className={cn(
                        "h-fit rounded-lg border-1 px-2 text-[10px] leading-px uppercase",
                        severityVariantMap[
                            rule.severity as typeof rule.severity
                        ],
                    )}>
                    {rule.severity}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col">
                <p className="text-text-secondary line-clamp-3 text-[13px]">
                    {rule.rule}
                </p>
            </CardContent>

            <CardFooter className="flex w-full items-center justify-between">
                <div className="flex flex-wrap gap-1">
                    {rule.language && (
                        <Badge>{ProgrammingLanguage[rule.language]}</Badge>
                    )}

                    {rule.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                    ))}
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("Like button clicked");
                        toggleLike();
                    }}>
                    <LikeButton
                        likes={likeCount}
                        isLiked={isLiked}
                        onLike={toggleLike}
                    />
                </div>
            </CardFooter>
        </Button>
    );
};
