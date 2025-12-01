"use client";

import * as React from "react";
import { cn } from "src/core/utils/components";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { MessageSquare, GitPullRequest } from "lucide-react";

type ReviewMode = "inline" | "pr-comment";

type Author = {
    name: string;
    avatar?: string;
    isBot?: boolean;
};

const KODY_AUTHOR: Author = {
    name: "kody-ci",
    avatar: "/assets/images/logo-nav.svg",
    isBot: true,
};

type KodyReviewPreviewProps = {
    mode: ReviewMode;
    author?: Author;
    comment?: string;
    className?: string;
    codeLine?: {
        number: number;
        content: string;
    };
};

function InlineReviewPreview({
    author,
    comment,
    codeLine,
}: {
    author: Author;
    comment: string;
    codeLine?: { number: number; content: string };
}) {
    return (
        <div className="flex flex-col rounded-lg border border-card-lv3 overflow-hidden text-xs">
            {codeLine && (
                <div className="flex items-center bg-card-lv1 border-b border-card-lv3">
                    <span className="px-3 py-1.5 text-text-placeholder font-mono border-r border-card-lv3 select-none">
                        {codeLine.number}
                    </span>
                    <code className="px-3 py-1.5 text-text-secondary font-mono truncate">
                        {codeLine.content}
                    </code>
                </div>
            )}
            <div className="flex gap-2.5 p-3 bg-card-lv2">
                <Avatar className="size-6 shrink-0">
                    {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                    <AvatarFallback className="text-[10px] font-medium">
                        {author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium text-text-primary">{author.name}</span>
                        {author.isBot && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-card-lv3 text-text-secondary">
                                bot
                            </span>
                        )}
                    </div>
                    <p className="text-text-secondary leading-relaxed">{comment}</p>
                </div>
            </div>
        </div>
    );
}

function PRCommentPreview({
    author,
    comment,
}: {
    author: Author;
    comment: string;
}) {
    return (
        <div className="flex flex-col rounded-lg border border-card-lv3 overflow-hidden text-xs">
            <div className="flex items-center gap-2 px-3 py-2 bg-card-lv1 border-b border-card-lv3">
                <GitPullRequest className="size-3.5 text-text-secondary" />
                <span className="text-text-secondary">PR Comment</span>
            </div>
            <div className="flex gap-2.5 p-3 bg-card-lv2">
                <Avatar className="size-6 shrink-0">
                    {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                    <AvatarFallback className="text-[10px] font-medium">
                        {author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="font-medium text-text-primary">{author.name}</span>
                        {author.isBot && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-card-lv3 text-text-secondary">
                                bot
                            </span>
                        )}
                    </div>
                    <p className="text-text-secondary leading-relaxed">{comment}</p>
                </div>
            </div>
        </div>
    );
}

export function KodyReviewPreview({
    mode,
    author = KODY_AUTHOR,
    comment = "This looks good! Consider adding error handling here.",
    className,
    codeLine = { number: 42, content: "const result = await fetchData();" },
}: KodyReviewPreviewProps) {
    return (
        <div className={cn("w-full", className)}>
            {mode === "inline" ? (
                <InlineReviewPreview
                    author={author}
                    comment={comment}
                    codeLine={codeLine}
                />
            ) : (
                <PRCommentPreview author={author} comment={comment} />
            )}
        </div>
    );
}

export function KodyReviewPreviewComparison({
    className,
    inlineComment = "Consider using optional chaining here.",
    prComment = "Overall the PR looks good. Here's a summary of the review...",
}: {
    className?: string;
    inlineComment?: string;
    prComment?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <MessageSquare className="size-3.5" />
                    <span>Inline comments (Per file)</span>
                </div>
                <KodyReviewPreview mode="inline" comment={inlineComment} />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <GitPullRequest className="size-3.5" />
                    <span>Single comment (Per PR)</span>
                </div>
                <KodyReviewPreview mode="pr-comment" comment={prComment} />
            </div>
        </div>
    );
}

export { KODY_AUTHOR };
export type { Author, ReviewMode };

