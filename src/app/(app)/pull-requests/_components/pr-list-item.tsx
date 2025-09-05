"use client";

import { Fragment, useState } from "react";
import { Badge } from "@components/ui/badge";
import { Link } from "@components/ui/link";
import { TableCell, TableRow } from "@components/ui/table";
import { ChevronDownIcon, GitBranchIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "src/core/utils/components";
import type { PullRequestExecution } from "@services/pull-requests";
import { buildPullRequestUrl } from "@services/pull-requests";

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
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
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

    return (
        <Fragment>
            <TableRow 
                className="hover:bg-accent/50 cursor-pointer p"
                onClick={() => setIsOpen(!isOpen)}
            >
                <TableCell className="w-8 px-4">
                    <ChevronDownIcon
                        className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            isOpen && "rotate-180"
                        )}
                    />
                </TableCell>
                <TableCell className="w-20 font-mono text-sm">
                    #{pr.prNumber}
                </TableCell>
                <TableCell className="min-w-0 flex-1">
                    <Link
                        href={prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline truncate flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {pr.title}
                        <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                    </Link>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-sm text-muted-foreground">
                        {pr.repositoryName}
                    </span>
                </TableCell>
                <TableCell className="w-40">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GitBranchIcon className="h-3 w-3" />
                        <span className="truncate">{pr.headBranchRef}</span>
                    </div>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(pr.createdAt)}
                    </span>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-sm">{pr.author.name}</span>
                </TableCell>
                <TableCell className="w-20 text-center">
                    {pr.merged ? (
                        <Badge variant="primary" className="text-xs">
                            Yes
                        </Badge>
                    ) : (
                        <Badge variant="helper" className="text-xs">
                            No
                        </Badge>
                    )}
                </TableCell>
                <TableCell className="w-32">
                    {getStatusBadge(
                        pr.automationExecution?.status || "pending",
                        pr.merged
                    )}
                </TableCell>
            </TableRow>

            {isOpen && (
                <TableRow className="p-20">
                    <TableCell colSpan={9} className="px-4 pb-4 pt-0 bg-accent/20">
                        <div className="ml-8">
                            <div className="space-y-3">
                                {pr.codeReviewTimeline.map((item, index) => (
                                    <div key={item.uuid} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center h-6">
                                                <div
                                                    className={cn(
                                                        "w-3 h-3 rounded-full border-2",
                                                        getTimelineStatusColor(item.status)
                                                    )}
                                                />
                                            </div>
                                            {index < pr.codeReviewTimeline.length - 1 && (
                                                <div className="w-px h-8 bg-border" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">
                                                    {item.message}
                                                </span>
                                                {getStatusBadge(item.status, false)}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTimeAgo(item.createdAt)}
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
