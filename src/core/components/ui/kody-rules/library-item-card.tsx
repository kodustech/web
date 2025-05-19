"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import type { LibraryRule } from "@services/kodyRules/types";
import { setRuleLike, type RuleLike } from "@services/ruleLike/fetch";
import { useMutation } from "@tanstack/react-query";
import { HeartIcon } from "lucide-react";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { useAuth } from "src/core/providers/auth.provider";
import { cn } from "src/core/utils/components";

import { Button } from "../button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";
import { Separator } from "../separator";
import { Spinner } from "../spinner";

const severityVariantMap = {
    Critical: "bg-danger/10 text-danger border-danger/64",
    High: "bg-warning/10 text-warning border-warning/64",
    Medium: "bg-alert/10 text-alert border-alert/64",
    Low: "bg-info/10 text-info border-info/64",
} as const satisfies Record<string, string>;

export const KodyRuleLibraryItem = ({
    rule,
    repositoryId,
    showLikeButton,
}: {
    rule: LibraryRule;
    repositoryId?: string;
    showLikeButton?: boolean;
}) => {
    const router = useRouter();
    const { userId } = useAuth();
    const [isLiked, setIsLiked] = useState(rule.isLiked);
    const [likeCount, setLikeCount] = useState(rule.likesCount ?? 0);

    useEffect(() => {
        setIsLiked(rule.isLiked);
        setLikeCount(rule.likesCount);
    }, [rule.isLiked, rule.likesCount]);

    const sortedTags = [...rule.tags.sort((a, b) => a.length - b.length)];

    const quantityOfCharactersInAllTags = sortedTags.reduce(
        (acc, item) => acc + item.length,
        0,
    );

    const { tagsToShow, tagsToHide } = sortedTags.reduce(
        (acc, item, _i, arr) => {
            if (arr.length <= 4 && quantityOfCharactersInAllTags <= 35) {
                acc.tagsToShow.push(item);
                return acc;
            }

            if (acc.charactersCount + item.length <= 30) {
                acc.charactersCount += item.length;
                acc.tagsToShow.push(item);
                return acc;
            }

            acc.tagsToHide.push(item);
            return acc;
        },
        {
            tagsToShow: [] as string[],
            tagsToHide: [] as string[],
            charactersCount: rule.language?.length ?? 0,
        },
    );

    const { mutate: toggleLike, isPending: isLikeActionInProgress } =
        useMutation<RuleLike, Error, void>({
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
                    if (ev.code === "Space" || ev.code === "Enter") {
                        (document.activeElement as HTMLDivElement)?.click();
                    }
                }}
                className="bg-card-lv2 flex h-full w-full flex-col transition hover:brightness-120 focus-visible:brightness-120"
                onClick={() => {
                    let route = `/library/kody-rules/${rule.uuid}`;
                    if (repositoryId)
                        route = `${route}?repositoryId=${repositoryId}`;

                    router.push(route);
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

            <Separator className="opacity-70" />

            <CardFooter className="bg-card-lv2 flex w-full cursor-auto items-end justify-between gap-4 px-5 py-4">
                <div className="flex flex-wrap items-center gap-[3px]">
                    {rule.language && (
                        <Badge className="h-2 px-2.5 font-normal">
                            {ProgrammingLanguage[rule.language]}
                        </Badge>
                    )}

                    {tagsToShow.map((tag) => (
                        <Badge key={tag} className="h-2 px-2.5 font-normal">
                            {tag}
                        </Badge>
                    ))}

                    {tagsToHide.length > 0 && (
                        <HoverCard openDelay={0} closeDelay={100}>
                            <HoverCardTrigger asChild>
                                <Button
                                    size="xs"
                                    variant="cancel"
                                    className="-ml-1 h-2 px-2">
                                    + {tagsToHide.length}
                                </Button>
                            </HoverCardTrigger>

                            <HoverCardContent className="flex flex-wrap gap-1">
                                {tagsToHide.map((tag) => (
                                    <Badge
                                        key={tag}
                                        className="h-2 px-2.5 font-normal">
                                        {tag}
                                    </Badge>
                                ))}
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>

                {showLikeButton && (
                    <Button
                        size="md"
                        variant="cancel"
                        onClick={() => toggleLike()}
                        className="-my-2 -mr-2 gap-1.5 px-2"
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
                )}
            </CardFooter>
        </Card>
    );
};
