"use client";

import { Fragment, useState, useEffect } from "react";
import { Badge } from "@components/ui/badge";
import { Link } from "@components/ui/link";
import { TableCell, TableRow } from "@components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import type { PullRequestExecution } from "@services/pull-requests";
import { buildPullRequestUrl } from "@services/pull-requests";
import { ChevronDownIcon, ExternalLinkIcon, GitBranchIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

interface PrListItemProps {
    pr: PullRequestExecution;
}

const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) return "less than 1 minute ago";
    if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    if (diffInHours < 24)
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInDays < 7)
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    if (diffInWeeks < 4)
        return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
};

const TimeAgoDisplay = ({ dateString }: { dateString: string }) => {
    const [displayedTime, setDisplayedTime] = useState(dateString);

    useEffect(() => {
        setDisplayedTime(formatTimeAgo(dateString));
    }, [dateString]);

    return <>{displayedTime}</>;
};

const getStatusBadge = (status: string, merged: boolean) => {
    if (merged) {
        return <Badge variant="primary">Merged</Badge>;
    }

    switch (status) {
        case "success":
            return <Badge variant="success">Success</Badge>;
        case "error":
            return <Badge variant="error">Error</Badge>;
        case "in_progress":
            return <Badge variant="in-progress">In Progress</Badge>;
        case "pending":
            return <Badge variant="helper">Pending</Badge>;
        default:
            return <Badge variant="helper">{status}</Badge>;
    }
};

const getTimelineStatusColor = (status: string) => {
    switch (status) {
        case "success":
            return "bg-success border-success";
        case "error":
            return "bg-error border-error";
        case "in_progress":
            return "bg-in-progress border-in-progress";
        default:
            return "bg-card-lv2 border-border";
    }
};

export const PrListItem = ({ pr }: PrListItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const prUrl = buildPullRequestUrl(pr);
    const automationOrigin = pr.automationExecution?.origin || "";

    const getOriginLabel = (origin: string) => {
        const o = origin?.toLowerCase?.() || "";
        if (o === "system") return "Automatic";
        if (o === "command") return "User Command";
        return origin;
    };

    const isAutomationStartMessage = (message: string) => {
        const m = message?.toLowerCase?.() || "";
        return m.includes("automation") && m.includes("start");
    };

    return (
        <Fragment>
            <TableRow
                className="hover:bg-accent/50 p cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}>
                <TableCell className="w-8 px-4">
                    <ChevronDownIcon
                        className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            isOpen && "rotate-180",
                        )}
                    />
                </TableCell>
                <TableCell className="w-20 font-mono text-sm">
                    #{pr.prNumber}
                </TableCell>
                <TableCell className="w-90 min-w-0 flex-1">
                    <Link
                        href={prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 truncate font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}>
                        {pr.title}
                        <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                    </Link>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-muted-foreground text-sm">
                        {pr.repositoryName}
                    </span>
                </TableCell>
                <TableCell className="w-40">
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                        <GitBranchIcon className="h-3 w-3" />
                        <span className="truncate">{pr.headBranchRef}</span>
                    </div>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-muted-foreground text-sm">
                        <TimeAgoDisplay dateString={pr.createdAt} />
                    </span>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-sm">{pr.author.name}</span>
                </TableCell>
                <TableCell className="w-20 text-center">
                    <div className="flex justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="rounded-md bg-[#42BE6520] px-3 py-1">
                                    {pr.suggestionsCount.sent}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Suggestions sent for this PR
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="rounded-md bg-[#592830] px-3 py-1">
                                    {pr.suggestionsCount.filtered}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Suggestions filtered out by your configuration
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TableCell>
                <TableCell className="w-32 text-center">
                    {getStatusBadge(
                        pr.automationExecution?.status || "pending",
                        pr.merged,
                    )}
                </TableCell>
            </TableRow>

            {isOpen && (
                <TableRow className="p-20">
                    <TableCell
                        colSpan={9}
                        className="bg-accent/20 px-4 pt-0 pb-4">
                        <div className="ml-8">
                            <div className="space-y-3">
                                {pr.codeReviewTimeline.map((item, index) => (
                                    <div key={item.uuid} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-6 items-center">
                                                <div
                                                    className={cn(
                                                        "h-3 w-3 rounded-full border-2",
                                                        getTimelineStatusColor(
                                                            item.status,
                                                        ),
                                                    )}
                                                />
                                            </div>
                                            {index <
                                                pr.codeReviewTimeline.length -
                                                1 && (
                                                    <div className="bg-border h-8 w-px" />
                                                )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {item.message}
                                                </span>
                                                {getStatusBadge(
                                                    item.status,
                                                    false,
                                                )}
                                                {automationOrigin &&
                                                    isAutomationStartMessage(
                                                        item.message,
                                                    ) && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-text-secondary whitespace-nowrap text-xs">
                                                                    · {getOriginLabel(
                                                                        automationOrigin,
                                                                    )}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-xs">
                                                                {automationOrigin?.toLowerCase?.() ===
                                                                    "system"
                                                                    ? "Triggered automatically by system"
                                                                    : "Triggered by user command"}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                            </div>
                                            <span className="text-muted-foreground text-xs">
                                                <TimeAgoDisplay dateString={item.createdAt} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    );
};
