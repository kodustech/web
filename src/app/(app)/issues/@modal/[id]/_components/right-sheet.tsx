"use client";

import { Fragment, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Link } from "@components/ui/link";
import { Progress } from "@components/ui/progress";
import { ScrollArea } from "@components/ui/scroll-area";
import { Separator } from "@components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@components/ui/sheet";
import { SyntaxHighlight } from "@components/ui/syntax-highlight";
import { useArrowShortcut } from "@hooks/use-arrow-shortcut";
import { useEffectOnce } from "@hooks/use-effect-once";
import { type getIssue } from "@services/issues/fetch";
import {
    ArrowLeft,
    ArrowRight,
    FileIcon,
    FolderGit2Icon,
    GitPullRequestArrowIcon,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import { cn } from "src/core/utils/components";

import { IssuesListContext } from "../../../_contexts/issues-list";
import { SeverityLevelSelect } from "./severity-level-select";
import { ShareButton } from "./share-button";

const DISABLE_ANIMATION_SESSION_STORAGE_KEY = "disable-animation";

export const RightSheet = ({
    issue,
    issueId,
}: {
    issueId: string;
    issue: Awaited<ReturnType<typeof getIssue>>;
}) => {
    const router = useRouter();
    const issues = use(IssuesListContext);

    /* START: disable opening animation when navigating between issues */
    const disableAnimation = useRef(
        globalThis.sessionStorage?.getItem(
            DISABLE_ANIMATION_SESSION_STORAGE_KEY,
        ) === "true",
    ).current;

    const setDisableAnimation = () =>
        globalThis.sessionStorage.setItem(
            DISABLE_ANIMATION_SESSION_STORAGE_KEY,
            "true",
        );

    useEffectOnce(() => {
        globalThis.sessionStorage.removeItem(
            DISABLE_ANIMATION_SESSION_STORAGE_KEY,
        );
    });
    /* END: disable opening animation when navigating between issues */

    const currentIssueIndex = issues.findIndex((i) => i.uuid === issueId);
    const previousIssueId: string | undefined =
        issues[currentIssueIndex - 1]?.uuid;
    const nextIssueId: string | undefined = issues[currentIssueIndex + 1]?.uuid;

    useArrowShortcut("left", () => {
        if (!previousIssueId) return;
        setDisableAnimation();
        router.push(`/issues/${previousIssueId}`);
    });
    useArrowShortcut("right", () => {
        if (!nextIssueId) return;
        setDisableAnimation();
        router.push(`/issues/${nextIssueId}`);
    });

    const descriptionSplittedInParagraphs = issue.description.split(". ");

    const fileLinesAffected =
        issue.startLine === issue.endLine
            ? issue.startLine.toString()
            : `${issue.startLine}~${issue.endLine}`;

    return (
        <Sheet open onOpenChange={() => router.push("/issues")}>
            <SheetContent
                className="sm:max-w-2xl"
                disableAnimation={disableAnimation}>
                <div className="mb-6 flex h-8 justify-between pr-14 pl-6">
                    <div className="flex gap-1">
                        <Link
                            disabled={!previousIssueId}
                            href={`/issues/${previousIssueId}`}
                            onClick={() => setDisableAnimation()}>
                            <Button variant="helper" size="icon-sm" decorative>
                                <ArrowLeft />
                            </Button>
                        </Link>

                        <Link
                            disabled={!nextIssueId}
                            href={`/issues/${nextIssueId}`}
                            onClick={() => setDisableAnimation()}>
                            <Button variant="helper" size="icon-sm" decorative>
                                <ArrowRight />
                            </Button>
                        </Link>
                    </div>

                    <ShareButton />
                </div>

                <SheetHeader>
                    <SheetTitle>{issue.title}</SheetTitle>
                    <SheetDescription>Opened {issue.age}</SheetDescription>

                    <div className="mt-4 flex gap-2">
                        <SeverityLevelSelect
                            issueId={issueId}
                            severity={issue.severity}
                        />
                    </div>
                </SheetHeader>

                <Separator className="mt-4" />

                <ScrollArea className="flex-1 *:py-6">
                    <div className="list-outside space-y-4 px-6 text-sm *:break-all">
                        <div className="flex gap-3">
                            <FolderGit2Icon className="text-secondary-light size-4.5" />

                            <Link
                                target="_blank"
                                href={issue.repositoryLink.url}
                                className="text-text-secondary link-hover:text-primary-light link-focused:text-primary-light underline">
                                {issue.gitOrganizationName}/
                                {issue.repositoryLink.label}
                            </Link>
                        </div>
                        <div className="flex gap-3">
                            <GitPullRequestArrowIcon className="text-secondary-light size-4.5" />

                            <div>
                                {issue.prLinks.map((c, i) => (
                                    <Fragment key={c.url}>
                                        {i > 0 ? ", " : ""}
                                        <Link
                                            href={c.url}
                                            target="_blank"
                                            className="text-text-secondary link-hover:text-primary-light link-focused:text-primary-light underline">
                                            #{c.label}
                                        </Link>
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <FileIcon className="text-secondary-light size-4.5" />

                            <Link
                                href={issue.fileLink.url}
                                target="_blank"
                                className="text-text-secondary link-hover:text-primary-light link-focused:text-primary-light underline">
                                {issue.fileLink.label}:{fileLinesAffected}
                            </Link>
                        </div>
                    </div>

                    <div className="mt-10 px-6">
                        <Heading variant="h3" className="mb-2">
                            Description
                        </Heading>

                        <div className="space-y-2">
                            {descriptionSplittedInParagraphs.map((d) => (
                                <p
                                    key={d}
                                    className="text-text-secondary text-sm">
                                    {d}
                                    {!d.endsWith(".") && "."}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 px-6">
                        <Heading variant="h3" className="mb-2">
                            Current code
                        </Heading>

                        <SyntaxHighlight language={issue.language}>
                            {issue.currentCode.trim()}
                        </SyntaxHighlight>
                    </div>
                </ScrollArea>

                <Separator />

                <SheetFooter className="mt-4">
                    <Card className="text-sm" color="lv1">
                        <CardHeader className="flex flex-row items-center justify-between gap-6 py-4">
                            <p>Team feedback from PR reactions</p>

                            <div className="flex items-center gap-1">
                                <Badge
                                    size="xs"
                                    variant="helper"
                                    className="pointer-events-none"
                                    leftIcon={
                                        <ThumbsUp className="text-success mr-1" />
                                    }>
                                    {issue.reactions.thumbsUp}
                                </Badge>

                                <Badge
                                    size="xs"
                                    variant="helper"
                                    className="pointer-events-none"
                                    leftIcon={
                                        <ThumbsDown className="text-danger mr-1" />
                                    }>
                                    {issue.reactions.thumbsDown}
                                </Badge>
                            </div>
                        </CardHeader>

                        <Progress
                            data-value={issue.reactions.thumbsUp}
                            data-max={
                                issue.reactions.thumbsUp +
                                issue.reactions.thumbsDown
                            }
                            className={cn(
                                "h-1",
                                "[--progress-background:var(--color-danger)]",
                                "[--progress-foreground:var(--color-success)]",

                                !issue.reactions.thumbsUp &&
                                    !issue.reactions.thumbsDown &&
                                    "[--progress-background:var(--color-card-lv3)]",
                            )}
                        />
                    </Card>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
