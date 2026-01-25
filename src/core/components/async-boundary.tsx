"use client";

import { ReactNode } from "react";
import { cn } from "src/core/utils/components";

import { PageBoundary } from "./page-boundary";
import { Skeleton } from "./ui/skeleton";

/**
 * AsyncBoundary - Simplified wrapper for async components
 *
 * Use PageBoundary for full control, AsyncBoundary for quick usage.
 *
 * @example
 * <AsyncBoundary>
 *   <MyAsyncComponent />
 * </AsyncBoundary>
 *
 * // Silent errors (widget that can fail):
 * <AsyncBoundary errorVariant="silent">
 *   <OptionalWidget />
 * </AsyncBoundary>
 */
interface AsyncBoundaryProps {
    children: ReactNode;
    skeleton?: ReactNode;
    errorVariant?: "card" | "inline" | "minimal" | "silent";
    className?: string;
}

export function AsyncBoundary({
    children,
    skeleton,
    errorVariant = "inline",
    className,
}: AsyncBoundaryProps) {
    const loadingFallback = skeleton ?? (
        <Skeleton className={cn("h-20 w-full", className)} />
    );

    return (
        <PageBoundary
            loading={loadingFallback}
            errorFallback={errorVariant === "silent" ? null : undefined}
            errorVariant={errorVariant === "silent" ? "inline" : errorVariant}>
            {children}
        </PageBoundary>
    );
}
