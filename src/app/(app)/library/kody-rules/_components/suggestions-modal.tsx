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
import { MessageSquare, GitPullRequest, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "src/core/utils/components";
import { Spinner } from "@components/ui/spinner";
import { Link } from "@components/ui/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

type SuggestionsModalProps = {
    ruleId: string;
    ruleTitle: string;
    variant?: "default" | "icon";
};

export const SuggestionsModal = ({ ruleId, ruleTitle, variant = "default" }: SuggestionsModalProps) => {
    const [open, setOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"detailed" | "minimal">("detailed");

    const { data: suggestions = [], isLoading } = useQuery<KodyRuleSuggestion[]>({
        queryKey: ["kody-rule-suggestions", ruleId],
        queryFn: () => getKodyRuleSuggestions(ruleId),
        enabled: open,
    });

    const groupedByPR = suggestions.reduce((acc, suggestion) => {
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
                                                <Badge variant="outline" className="h-2">
                                                    #{group.prNumber}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-text-secondary">
                                                {group.repositoryFullName}
                                            </p>
                                        </div>
                                        <Link href={group.prUrl} target="_blank" rel="noopener noreferrer">
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
                                        {group.suggestions.map((suggestion) => (
                                            <div key={suggestion.id} className="space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <Badge variant="outline" className="h-2 font-mono text-xs mb-2">
                                                            {suggestion.relevantFile} L{suggestion.relevantLinesStart}-{suggestion.relevantLinesEnd}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <p className="text-sm">{suggestion.suggestionContent}</p>

                                                {viewMode === "detailed" && (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-text-secondary mb-2">
                                                                Existing Code:
                                                            </p>
                                                            <SyntaxHighlight
                                                                language={suggestion.language}
                                                                className="text-xs">
                                                                {suggestion.existingCode}
                                                            </SyntaxHighlight>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs font-semibold text-text-secondary mb-2">
                                                                Improved Code:
                                                            </p>
                                                            <SyntaxHighlight
                                                                language={suggestion.language}
                                                                className="text-xs">
                                                                {suggestion.improvedCode}
                                                            </SyntaxHighlight>
                                                        </div>
                                                    </div>
                                                )}

                                                {group.suggestions.indexOf(suggestion) < group.suggestions.length - 1 && (
                                                    <Separator className="!mt-4" />
                                                )}
                                            </div>
                                        ))}
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

