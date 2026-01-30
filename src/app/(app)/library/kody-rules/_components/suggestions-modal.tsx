"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog";
import { SyntaxHighlight } from "@components/ui/syntax-highlight";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";
import { getKodyRuleSuggestions } from "@services/kodyRules/fetch";
import type { KodyRuleSuggestion } from "@services/kodyRules/types";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, GitPullRequest, ExternalLink, Maximize2, Minimize2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "src/core/utils/components";
import { safeArray } from "src/core/utils/safe-array";
import { Spinner } from "@components/ui/spinner";
import { Link } from "@components/ui/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

type SuggestionsModalProps = {
    ruleId: string;
    ruleTitle: string;
    variant?: "default" | "icon";
};

const buildExternalPullRequestUrl = ({
    prUrl,
    prNumber,
    repositoryFullName,
}: {
    prUrl?: string;
    prNumber: number;
    repositoryFullName?: string;
}) => {
    if (!prUrl) {
        return `#pr-${prNumber}`;
    }

    try {
        const url = new URL(prUrl);
        const host = url.host.toLowerCase();

        if (host.includes("github.com")) {
            if (host.includes("api.github.com")) {
                const apiMatch = url.pathname.match(/\/repos\/([^/]+)\/([^/]+)\/pulls/);
                if (apiMatch) {
                    const [, owner, repo] = apiMatch;
                    return `https://github.com/${owner}/${repo}/pull/${prNumber}`;
                }
                if (repositoryFullName) {
                    return `https://github.com/${repositoryFullName}/pull/${prNumber}`;
                }
            } else {
                return prUrl;
            }
        }

        if (host.includes("gitlab.com")) {
            if (url.pathname.includes("/api/v4/projects/")) {
                if (repositoryFullName) {
                    return `https://gitlab.com/${repositoryFullName}/-/merge_requests/${prNumber}`;
                }
            } else {
                return prUrl;
            }
        }

        if (host.includes("bitbucket.org")) {
            if (host.includes("api.bitbucket.org")) {
                const apiMatch = url.pathname.match(/\/2\.0\/repositories\/([^/]+)\/([^/]+)/);
                if (apiMatch) {
                    const [, workspace, repo] = apiMatch;
                    return `https://bitbucket.org/${workspace}/${repo}/pull-requests/${prNumber}`;
                }
                if (repositoryFullName) {
                    return `https://bitbucket.org/${repositoryFullName}/pull-requests/${prNumber}`;
                }
            } else {
                return prUrl;
            }
        }

        if (host.includes("dev.azure.com")) {
            if (!url.pathname.includes("/_apis/")) {
                return prUrl;
            }

            const azureMatch = prUrl.match(/dev\.azure\.com\/([^/]+)\/([^/]+)\/_apis/);
            const repositoryName = repositoryFullName?.split("/").pop();
            if (azureMatch && repositoryName) {
                const [, organization, project] = azureMatch;
                return `https://dev.azure.com/${organization}/${project}/_git/${repositoryName}/pullrequest/${prNumber}`;
            }
        }

        if (!prUrl.includes("/api/") && !prUrl.includes("/_apis/")) {
            return prUrl;
        }
    } catch {
        return prUrl;
    }

    return `#pr-${prNumber}`;
};

export const SuggestionsModal = ({ ruleId, ruleTitle, variant = "default" }: SuggestionsModalProps) => {
    const [open, setOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"detailed" | "minimal">("detailed");

    const { data: suggestions = [], isLoading, isError, refetch } = useQuery<KodyRuleSuggestion[]>({
        queryKey: ["kody-rule-suggestions", ruleId],
        queryFn: () => getKodyRuleSuggestions(ruleId),
        enabled: open,
    });

    const groupedByPR = safeArray<KodyRuleSuggestion>(suggestions).reduce((acc, suggestion) => {
        const key = `${suggestion.prNumber}-${suggestion.prTitle}`;
        if (!acc[key]) {
            acc[key] = {
                prNumber: suggestion.prNumber,
                prTitle: suggestion.prTitle,
                prUrl: suggestion.prUrl,
                repositoryFullName: suggestion.repositoryFullName,
                suggestions: [],
            };
        }
        acc[key].suggestions.push(suggestion);
        return acc;
    }, {} as Record<string, {
        prNumber: number;
        prTitle: string;
        prUrl: string;
        repositoryFullName: string;
        suggestions: KodyRuleSuggestion[];
    }>);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        {variant === "icon" ? (
                            <Button
                                size="icon-md"
                                variant="secondary"
                                className="size-9">
                                <MessageSquare />
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="secondary"
                                className="gap-2"
                                leftIcon={<MessageSquare className="size-3" />}>
                                View Suggestions
                            </Button>
                        )}
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent className="z-[100]">
                    <p>View suggestions sent in PRs</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle>Suggestions for {ruleTitle}</DialogTitle>
                            <DialogDescription>
                                View all code suggestions sent for this rule across your pull requests
                            </DialogDescription>
                        </div>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon-sm"
                                    variant="cancel"
                                    onClick={() => setViewMode(viewMode === "detailed" ? "minimal" : "detailed")}
                                    className="shrink-0">
                                    {viewMode === "detailed" ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[100]">
                                <p>{viewMode === "detailed" ? "Switch to minimal view" : "Switch to detailed view"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner className="size-6" />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                            <AlertCircle className="size-12 text-danger" />
                            <p className="text-text-secondary text-sm">
                                Failed to load suggestions
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={<RefreshCw className="size-3" />}
                                onClick={() => refetch()}>
                                Try again
                            </Button>
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="size-12 text-text-secondary mb-4" />
                            <p className="text-text-secondary text-sm">
                                No suggestions found for this rule yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.values(groupedByPR).map((group) => (
                                <div key={`${group.prNumber}-${group.prTitle}`} className="border-card-lv2 border rounded-lg p-4 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <GitPullRequest className="size-4 text-text-secondary" />
                                                <h3 className="font-semibold text-sm">
                                                    {group.prTitle}
                                                </h3>
                                                <Badge variant="secondary" className="h-2">
                                                    #{group.prNumber}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-text-secondary">
                                                {group.repositoryFullName}
                                            </p>
                                        </div>
                                        <Link
                                            href={buildExternalPullRequestUrl({
                                                prUrl: group.prUrl,
                                                prNumber: group.prNumber,
                                                repositoryFullName: group.repositoryFullName,
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <Button
                                                size="sm"
                                                variant="cancel"
                                                className="gap-2"
                                                rightIcon={<ExternalLink className="size-3" />}>
                                                View PR
                                            </Button>
                                        </Link>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        {group.suggestions.map((suggestion) => {
                                            const existingCode = suggestion.existingCode?.trim();
                                            const improvedCode = suggestion.improvedCode?.trim();
                                            const shouldShowDetailedView =
                                                viewMode === "detailed" && (existingCode || improvedCode);

                                            return (
                                                <div key={suggestion.id} className="space-y-3">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <Badge variant="secondary" className="h-2 font-mono text-xs mb-2">
                                                                {suggestion.relevantFile} L{suggestion.relevantLinesStart}-
                                                                {suggestion.relevantLinesEnd}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm">{suggestion.suggestionContent}</p>

                                                    {shouldShowDetailedView && (
                                                        <div className="space-y-3">
                                                            {existingCode && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-text-secondary mb-2">
                                                                        Existing Code:
                                                                    </p>
                                                                    <SyntaxHighlight
                                                                        language={suggestion.language}
                                                                        className="text-xs">
                                                                        {existingCode}
                                                                    </SyntaxHighlight>
                                                                </div>
                                                            )}

                                                            {improvedCode && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-text-secondary mb-2">
                                                                        Improved Code:
                                                                    </p>
                                                                    <SyntaxHighlight
                                                                        language={suggestion.language}
                                                                        className="text-xs">
                                                                        {improvedCode}
                                                                    </SyntaxHighlight>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {group.suggestions.indexOf(suggestion) < group.suggestions.length - 1 && (
                                                        <Separator className="!mt-4" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
