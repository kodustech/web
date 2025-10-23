"use client";

import { Badge } from "@components/ui/badge";
import { 
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { 
    AlertTriangle,
    CheckCircle, 
    Clock,
    Info,
    XCircle
} from "lucide-react";
import React from "react";

export interface ExternalReferencesData {
    references: Array<{
        filePath: string;
        repositoryName: string;
        originalText?: string;
        lineRange?: { start: number; end: number } | null;
    }>;
    syncErrors: Array<string | {
        fileName?: string;
        message?: string;
        errorType?: string;
        attemptedPaths?: string[];
        timestamp?: string;
    }>;
    processingStatus: "completed" | "processing" | "failed" | "pending";
}

export const useHighlightReferences = (
    text: string,
    references: ExternalReferencesData["references"]
) => {
    const getHighlightedParts = React.useMemo(() => {
        if (!text || references.length === 0) {
            return null;
        }

        const parts = [];
        let lastIndex = 0;

        references.forEach((ref) => {
            const pattern = new RegExp(
                ref.originalText ? 
                    ref.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') :
                    ref.filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'gi'
            );

            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
                }
                parts.push({
                    type: 'reference',
                    content: match[0],
                    filePath: ref.filePath,
                    repositoryName: ref.repositoryName,
                });
                lastIndex = pattern.lastIndex;
            }
        });

        if (lastIndex < text.length) {
            parts.push({ type: 'text', content: text.slice(lastIndex) });
        }

        return parts.length > 0 ? parts : null;
    }, [text, references]);

    return getHighlightedParts;
};

interface ExternalReferencesDisplayProps {
    externalReferences?: ExternalReferencesData;
    onProcessingChange?: (isProcessing: boolean) => void;
    compact?: boolean;
}

export function ExternalReferencesDisplay({ 
    externalReferences,
    onProcessingChange,
    compact = false
}: ExternalReferencesDisplayProps) {
    if (!externalReferences) {
        return null;
    }

    const { references, syncErrors, processingStatus } = externalReferences;

    React.useEffect(() => {
        onProcessingChange?.(processingStatus === "processing" || processingStatus === "pending");
    }, [processingStatus, onProcessingChange]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
            case "processing":
                return <Clock className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
            case "failed":
                return <XCircle className="h-3.5 w-3.5 text-red-500" />;
            case "pending":
                return <Clock className="h-3.5 w-3.5 text-yellow-500 animate-spin" />;
            default:
                return <Info className="h-3.5 w-3.5 text-gray-500" />;
        }
    };

    const hasErrors = syncErrors.length > 0;
    const hasReferences = references.length > 0;
    const isProcessingStatus = processingStatus === "processing" || processingStatus === "pending";

    if (!hasReferences && !hasErrors && !isProcessingStatus) {
        return null;
    }

    const getErrorMessage = (error: any) => {
        if (typeof error === 'string') {
            return error;
        }
        if (error && typeof error === 'object') {
            const fileName = error.fileName || 'Unknown file';
            const message = error.message || error.details || 'Unknown error';
            const errorType = error.errorType ? ` (${error.errorType})` : '';
            return `${fileName}: ${message}${errorType}`;
        }
        return String(error);
    };

    return (
        <div className={compact ? "mt-1.5 flex flex-col gap-0.5" : "flex items-center gap-1 flex-wrap"}>
            {isProcessingStatus && !hasReferences && !hasErrors && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                    {getStatusIcon(processingStatus)}
                    <span>Processing references...</span>
                </div>
            )}

            {hasReferences && compact ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary cursor-help transition-colors">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>
                                Found {references.length} reference{references.length > 1 ? 's' : ''}: {references.map(r => r.filePath).join(', ')}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                        <div className="space-y-1.5">
                            {references.map((ref, idx) => (
                                <div key={idx} className="text-xs">
                                    <p className="font-medium">{ref.filePath}</p>
                                    <p className="text-text-secondary">{ref.repositoryName}</p>
                                    {ref.lineRange && (
                                        <p className="text-text-secondary text-[10px]">
                                            Lines {ref.lineRange.start}-{ref.lineRange.end}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TooltipContent>
                </Tooltip>
            ) : !compact && hasReferences ? (
                <div className="flex items-center gap-1 text-xs">
                    {getStatusIcon(processingStatus)}
                    <div className="flex gap-1 flex-wrap">
                        {references.map((ref, idx) => (
                            <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-xs py-0 px-1.5 cursor-help rounded-md border bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity inline-flex items-center"
                                    >
                                        {ref.filePath}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="flex flex-col gap-0.5">
                                        <p className="font-medium">{ref.filePath}</p>
                                        <p className="text-xs text-text-secondary">
                                            {ref.repositoryName}
                                        </p>
                                        {ref.lineRange && (
                                            <p className="text-text-secondary text-[10px]">
                                                Lines {ref.lineRange.start}-{ref.lineRange.end}
                                            </p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            ) : null}

            {hasErrors && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary cursor-help transition-colors">
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                            <span>{syncErrors.length} sync error{syncErrors.length > 1 ? 's' : ''}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                        <div className="space-y-2">
                            <p className="text-xs font-medium">Sync Errors:</p>
                            {syncErrors.slice(0, 3).map((error, idx) => {
                                const isObject = typeof error === 'object' && error !== null;
                                return (
                                    <div key={idx} className="text-xs space-y-0.5">
                                        <p className="font-medium text-text-primary">{getErrorMessage(error)}</p>
                                        {isObject && (error as any).attemptedPaths && (error as any).attemptedPaths.length > 0 && (
                                            <p className="text-text-secondary text-[10px]">
                                                Attempted: {(error as any).attemptedPaths.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                            {syncErrors.length > 3 && (
                                <p className="text-xs text-text-secondary italic">+{syncErrors.length - 3} more...</p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}