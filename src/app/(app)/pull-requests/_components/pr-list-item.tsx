"use client";

import { Fragment, useState, useEffect } from "react";
import { Badge } from "@components/ui/badge";
import { buttonVariants } from "@components/ui/button";
import { Link } from "@components/ui/link";
import { TableCell, TableRow } from "@components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import type { CodeReviewTimelineItem } from "@services/pull-requests";
import { buildPullRequestUrl } from "@services/pull-requests";
import NextLink from "next/link";
import {
    ChevronDownIcon,
    ExternalLinkIcon,
    GitBranchIcon,
} from "lucide-react";
import { cn } from "src/core/utils/components";

import type { PullRequestExecutionGroup } from "./types";

interface PrListItemProps {
    group: PullRequestExecutionGroup;
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

const formatDuration = (start: string, end?: string | null) => {
    const startMs = Date.parse(start);
    const endMs = end ? Date.parse(end) : Date.now();

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
        return null;
    }

    const diffMs = Math.max(0, endMs - startMs);
    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    if (days > 0) {
        return `${days}d ${hours}h`;
    }

    if (totalHours > 0) {
        return `${totalHours}h ${minutes}m`;
    }

    if (totalMinutes > 0) {
        return `${totalMinutes}m ${seconds}s`;
    }

    return `${seconds}s`;
};

const getStatusBadge = (status: string, merged: boolean) => {
    if (merged) {
        return <Badge variant="primary" className="whitespace-nowrap">Merged</Badge>;
    }

    switch (status) {
        case "success":
            return <Badge variant="success" className="whitespace-nowrap">Success</Badge>;
        case "error":
            return <Badge variant="error" className="whitespace-nowrap">Error</Badge>;
        case "in_progress":
            return <Badge variant="in-progress" className="whitespace-nowrap">In Progress</Badge>;
        case "skipped":
            return <Badge variant="helper" className="whitespace-nowrap">Skipped</Badge>;
        case "pending":
            return <Badge variant="helper" className="whitespace-nowrap">Pending</Badge>;
        default:
            return <Badge variant="helper" className="whitespace-nowrap">{status}</Badge>;
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
        case "skipped":
            return "bg-card-lv2 border-border";
        default:
            return "bg-card-lv2 border-border";
    }
};

const formatStageName = (raw: string) => {
    return raw
        .replace(/Stage$/i, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();
};

const formatSha = (sha?: string | null) => {
    if (!sha) return null;
    return sha.length > 8 ? sha.slice(0, 7) : sha;
};

const parseStageMessage = (message: string) => {
    const trimmed = message.trim();
    let base = trimmed;
    let detail: string | null = null;

    const parenMatch = trimmed.match(/^(.*)\s*\(([^)]+)\)\s*$/);
    if (parenMatch) {
        base = parenMatch[1].trim();
        detail = parenMatch[2].trim();
    }

    if (!detail) {
        const separator = base.includes(" - ")
            ? " - "
            : base.includes(": ")
              ? ": "
              : null;
        if (separator) {
            const [left, right] = base.split(separator);
            if (left && right) {
                base = left.trim();
                detail = right.trim();
            }
        }
    }

    const stageMatch = base.match(
        /^(starting|completed|failed|skipped)\s+stage\s+(.+?)(?:\s+(?:because|due to)\s+(.+))?$/i,
    );

    if (stageMatch) {
        const verb = stageMatch[1]?.toLowerCase?.() || "";
        const stageName = stageMatch[2] || base;
        const reason = stageMatch[3]?.trim();
        const label = formatStageName(stageName);
        const combinedDetail = reason
            ? detail
                ? `${reason} (${detail})`
                : reason
            : detail;

        if (verb === "starting") {
            return {
                label,
                badge: { label: "Starting", variant: "in-progress" },
                detail: combinedDetail,
            };
        }

        if (verb === "completed") {
            return {
                label,
                badge: { label: "Completed", variant: "success" },
                detail: combinedDetail,
            };
        }

        if (verb === "skipped") {
            return {
                label,
                badge: { label: "Skipped", variant: "helper" },
                detail: combinedDetail,
            };
        }

        return {
            label,
            badge: { label: "Failed", variant: "error" },
            detail: combinedDetail,
        };
    }

    const normalizedBase = base.toLowerCase();
    if (
        normalizedBase.includes(" is ") &&
        /(disabled|inactive|not active|not enabled|off|false)/.test(
            normalizedBase,
        )
    ) {
        const isIndex = normalizedBase.indexOf(" is ");
        if (isIndex > 0) {
            const label = formatStageName(base.slice(0, isIndex).trim());
            const reason = detail ? `${base} (${detail})` : base;

            return {
                label,
                badge: { label: "Skipped", variant: "helper" },
                detail: reason,
            };
        }
    }

    return {
        label: base,
        badge: null as null | {
            label: string;
            variant: "in-progress" | "success" | "error" | "helper";
        },
        detail,
    };
};

const getMetadataReason = (
    metadata?: CodeReviewTimelineItem["metadata"] | null,
): string | null => {
    if (!metadata) return null;

    const candidates = [
        "reason",
        "message",
        "detail",
        "details",
        "description",
        "error",
    ].map((key) =>
        typeof metadata === "object" && metadata
            ? (metadata as Record<string, any>)[key]
            : null,
    );

    for (const value of candidates) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return null;
};

const getMetadataTech = (
    metadata?: CodeReviewTimelineItem["metadata"] | null,
): string | null => {
    if (!metadata || typeof metadata !== "object") return null;
    const value = (metadata as Record<string, any>).tech;
    return typeof value === "string" && value.trim() ? value.trim() : null;
};

const getMetadataCta = (
    metadata?: CodeReviewTimelineItem["metadata"] | null,
): { label: string; href: string; external?: boolean } | null => {
    if (!metadata || typeof metadata !== "object") return null;
    const cta = (metadata as Record<string, any>).cta;
    if (!cta || typeof cta !== "object") return null;
    if (typeof cta.label !== "string" || typeof cta.href !== "string") {
        return null;
    }

    return {
        label: cta.label,
        href: cta.href,
        external: Boolean(cta.external),
    };
};

const stageMessagePattern = /^(starting|completed|failed|skipped)\s+stage\s+/i;

const getStageDisplay = (item: CodeReviewTimelineItem) => {
    const parsed = parseStageMessage(item.message);
    const shouldUseStageName =
        !!item.stageName &&
        (stageMessagePattern.test(item.message) || item.status === "skipped");
    const label = shouldUseStageName
        ? formatStageName(item.stageName as string)
        : parsed.label;
    const reasonFromMetadata = getMetadataReason(item.metadata);
    const techFromMetadata = getMetadataTech(item.metadata);
    const cta = getMetadataCta(item.metadata);
    const reasonFromMessage =
        parsed.detail ||
        ((item.status === "skipped" || item.status === "error") &&
        item.stageName &&
        !stageMessagePattern.test(item.message)
            ? item.message
            : null);

    return {
        label,
        badge: parsed.badge,
        reason: reasonFromMetadata ?? reasonFromMessage ?? null,
        tech: techFromMetadata,
        cta,
        duration: formatDuration(
            item.createdAt,
            item.status === "in_progress"
                ? undefined
                : item.finishedAt ?? item.updatedAt ?? item.createdAt,
        ),
    };
};

const getCurrentStageItem = (items: CodeReviewTimelineItem[]) => {
    if (!items.length) return null;

    return items.reduce((latest, item) => {
        const latestTime = Date.parse(latest.createdAt);
        const itemTime = Date.parse(item.createdAt);

        if (Number.isNaN(latestTime) && !Number.isNaN(itemTime)) {
            return item;
        }
        if (Number.isNaN(itemTime)) {
            return latest;
        }

        return itemTime > latestTime ? item : latest;
    }, items[0]);
};

export const PrListItem = ({ group }: PrListItemProps) => {
    const { latest, executions, reviewCount } = group;
    const [isOpen, setIsOpen] = useState(false);
    const prUrl = buildPullRequestUrl(latest);
    const currentStage = getCurrentStageItem(latest.codeReviewTimeline);
    const currentStageInfo = currentStage
        ? getStageDisplay(currentStage)
        : null;

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
                    #{latest.prNumber}
                </TableCell>
                <TableCell className="max-w-[360px]">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href={prUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex max-w-[360px] items-center gap-1 font-medium hover:underline"
                                onClick={(e) => e.stopPropagation()}>
                                <span className="truncate">{latest.title}</span>
                                <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                            {latest.title}
                        </TooltipContent>
                    </Tooltip>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-muted-foreground block truncate text-sm">
                        {latest.repositoryName}
                    </span>
                </TableCell>
                <TableCell className="w-40">
                    <div className="text-muted-foreground flex w-full max-w-[10rem] items-center gap-1 text-sm">
                        <GitBranchIcon className="h-3 w-3 shrink-0" />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="truncate">
                                    {latest.headBranchRef}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {latest.headBranchRef}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </TableCell>
                <TableCell className="w-40">
                    <span className="block truncate text-sm">
                        {latest.author.name}
                    </span>
                </TableCell>
                <TableCell className="min-w-[16rem]">
                    {currentStage ? (
                        <div className="min-w-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-muted-foreground block truncate text-sm">
                                        {currentStageInfo?.label ??
                                            currentStage.message}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                    {currentStageInfo?.reason
                                        ? `${currentStageInfo.label} · ${currentStageInfo.reason}${
                                              currentStageInfo.tech
                                                  ? ` (Tech: ${currentStageInfo.tech})`
                                                  : ""
                                          }`
                                        : currentStage.message}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                    )}
                </TableCell>
                <TableCell className="w-20 text-center">
                    <span className="text-text-secondary text-sm">
                        {reviewCount}
                    </span>
                </TableCell>
                <TableCell className="w-32">
                    <span className="text-muted-foreground text-sm">
                        <TimeAgoDisplay dateString={latest.createdAt} />
                    </span>
                </TableCell>
                <TableCell className="w-20 text-center">
                    <div className="flex justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="rounded-md bg-[#42BE6520] px-3 py-1">
                                    {latest.suggestionsCount.sent}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Suggestions sent for this PR
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="rounded-md bg-[#592830] px-3 py-1">
                                    {latest.suggestionsCount.filtered}
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
                        latest.automationExecution?.status || "pending",
                        latest.merged,
                    )}
                </TableCell>
            </TableRow>

            {isOpen && (
                <TableRow className="bg-card-lv1/30">
                    <TableCell
                        colSpan={11}
                        className="px-4 pb-6 pt-2">
                        <div className="ml-10 pt-2">
                            <div className="space-y-4">
                                {executions.map((execution, index) => {
                                    const executionKey =
                                        execution.executionId ||
                                        execution.automationExecution?.uuid ||
                                        `${execution.prId}-${execution.automationExecution?.createdAt ?? execution.updatedAt ?? execution.createdAt}-${index}`;
                                    const executionOrigin =
                                        execution.automationExecution?.origin ||
                                        "";
                                    const executionStartedAt =
                                        execution.automationExecution
                                            ?.createdAt ?? execution.createdAt;
                                    const executionFinishedAt =
                                        execution.automationExecution
                                            ?.updatedAt ?? execution.updatedAt;
                                    const executionDuration = formatDuration(
                                        executionStartedAt,
                                        executionFinishedAt,
                                    );

                                    return (
                                        <div
                                            key={executionKey}
                                            className="rounded-lg border border-border/60 bg-card-lv1/40 px-4 py-3">
                                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
                                                        Review{" "}
                                                        {reviewCount -
                                                            index}
                                                    </span>
                                                    {getStatusBadge(
                                                        execution
                                                            .automationExecution
                                                            ?.status ||
                                                            "pending",
                                                        false,
                                                    )}
                                                    {executionDuration && (
                                                        <span className="text-text-secondary text-xs">
                                                            {execution
                                                                .automationExecution
                                                                ?.status ===
                                                            "in_progress"
                                                                ? "Elapsed: "
                                                                : "Duration: "}
                                                            {
                                                                executionDuration
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                {executionStartedAt && (
                                                    <span className="text-text-secondary text-xs">
                                                        <TimeAgoDisplay
                                                            dateString={
                                                                executionStartedAt
                                                            }
                                                        />
                                                    </span>
                                                )}
                                            </div>
                                            {(execution.reviewedCommitSha ||
                                                execution.reviewedCommitUrl ||
                                                prUrl) && (
                                                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                                                    {execution.reviewedCommitUrl ? (
                                                        <Link
                                                            href={
                                                                execution.reviewedCommitUrl
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-text-primary">
                                                            {formatSha(
                                                                execution.reviewedCommitSha,
                                                            ) || "View commit"}
                                                        </Link>
                                                    ) : (
                                                        execution.reviewedCommitSha && (
                                                            <span className="font-mono text-text-primary">
                                                                {formatSha(
                                                                    execution.reviewedCommitSha,
                                                                )}
                                                            </span>
                                                        )
                                                    )}
                                                    <Link
                                                        href={prUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={buttonVariants(
                                                            {
                                                                variant:
                                                                    "helper",
                                                                size: "xs",
                                                            },
                                                        )}>
                                                        Open PR
                                                    </Link>
                                                </div>
                                            )}
                                            <div className="relative pl-6">
                                                <div className="bg-border/70 absolute left-[0.5625rem] top-2 h-[calc(100%-0.75rem)] w-px" />
                                                <div className="space-y-4">
                                                    {execution.codeReviewTimeline.map(
                                                        (item) => {
                                                            const isActive =
                                                                item.status ===
                                                                "in_progress";
                                                            const stageInfo =
                                                                getStageDisplay(
                                                                    item,
                                                                );

                                                            return (
                                                                <div
                                                                    key={
                                                                        item.uuid
                                                                    }
                                                                    className={cn(
                                                                        "group flex gap-4",
                                                                        isActive &&
                                                                            "rounded-lg border-l-2 border-in-progress bg-card-lv2/60 px-3 py-2",
                                                                    )}>
                                                                    <div className="relative flex w-4 justify-center">
                                                                        <span
                                                                            className={cn(
                                                                                "mt-1 h-2.5 w-2.5 rounded-full border-2",
                                                                                isActive &&
                                                                                    "h-3 w-3",
                                                                                getTimelineStatusColor(
                                                                                    item.status,
                                                                                ),
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                                                            {stageInfo.badge && (
                                                                                <Badge
                                                                                    variant={
                                                                                        stageInfo
                                                                                            .badge
                                                                                            .variant
                                                                                    }
                                                                                    className="text-[10px] uppercase tracking-wide">
                                                                                    {
                                                                                        stageInfo
                                                                                            .badge
                                                                                            .label
                                                                                    }
                                                                                </Badge>
                                                                            )}
                                                                            <span className="text-sm font-medium">
                                                                                {
                                                                                    stageInfo.label
                                                                                }
                                                                            </span>
                                                                            {getStatusBadge(
                                                                                item.status,
                                                                                false,
                                                                            )}
                                                                            {executionOrigin &&
                                                                                isAutomationStartMessage(
                                                                                    item.message,
                                                                                ) && (
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <span className="text-text-secondary whitespace-nowrap text-xs">
                                                                                                ·{" "}
                                                                                                {getOriginLabel(
                                                                                                    executionOrigin,
                                                                                                )}
                                                                                            </span>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className="text-xs">
                                                                                            {executionOrigin?.toLowerCase?.() ===
                                                                                            "system"
                                                                                                ? "Triggered automatically by system"
                                                                                                : "Triggered by user command"}
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                )}
                                                                        </div>
                                                                        {stageInfo.duration && (
                                                                            <span className="text-muted-foreground text-xs">
                                                                                {item.status ===
                                                                                "in_progress"
                                                                                    ? "Elapsed: "
                                                                                    : "Duration: "}
                                                                                {
                                                                                    stageInfo.duration
                                                                                }
                                                                            </span>
                                                                        )}
                                                                        {stageInfo.reason && (
                                                                            <p className="text-muted-foreground text-xs">
                                                                                Reason:{" "}
                                                                                {
                                                                                    stageInfo.reason
                                                                                }
                                                                            </p>
                                                                        )}
                                                                        {stageInfo.tech && (
                                                                            <p className="text-muted-foreground text-xs">
                                                                                Tech:{" "}
                                                                                {stageInfo.tech}
                                                                            </p>
                                                                        )}
                                                                        {stageInfo.cta && (
                                                                            <NextLink
                                                                                href={
                                                                                    stageInfo
                                                                                        .cta
                                                                                        .href
                                                                                }
                                                                                target={
                                                                                    stageInfo
                                                                                        .cta
                                                                                        .external
                                                                                        ? "_blank"
                                                                                        : undefined
                                                                                }
                                                                                rel={
                                                                                    stageInfo
                                                                                        .cta
                                                                                        .external
                                                                                        ? "noopener noreferrer"
                                                                                        : undefined
                                                                                }
                                                                                className={buttonVariants(
                                                                                    {
                                                                                        variant:
                                                                                            "helper",
                                                                                        size: "xs",
                                                                                    },
                                                                                )}>
                                                                                {
                                                                                    stageInfo
                                                                                        .cta
                                                                                        .label
                                                                                }
                                                                            </NextLink>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    );
};
