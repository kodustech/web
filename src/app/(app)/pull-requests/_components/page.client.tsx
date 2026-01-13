"use client";

import { useEffect, useRef, useState } from "react";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { useDebounce } from "@hooks/use-debounce";
import { useInfinitePullRequestExecutions } from "@services/pull-requests";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { PrDataTable } from "./pr-data-table";
import { PullRequestsFilters } from "./pull-requests-filters";

export function PullRequestsPageClient() {
    const { teamId } = useSelectedTeamId();
    const [selectedRepository, setSelectedRepository] = useState<string>();
    const [pullRequestTitle, setPullRequestTitle] = useState("");
    const [pullRequestNumber, setPullRequestNumber] = useState("");
    const [suggestionsFilter, setSuggestionsFilter] = useState<
        "all" | "true" | "false"
    >("all");

    const debouncedTitle = useDebounce(pullRequestTitle, 400);
    const debouncedNumber = useDebounce(pullRequestNumber, 400);

    const normalizedTitle = debouncedTitle.trim();
    const normalizedNumber = debouncedNumber.trim();
    const hasSentSuggestionsParam =
        suggestionsFilter === "true"
            ? true
            : suggestionsFilter === "false"
              ? false
              : undefined;

    const {
        items: pullRequests,
        isLoading,
        error,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useInfinitePullRequestExecutions(
        {
            teamId,
            repositoryName: selectedRepository,
            pullRequestTitle: normalizedTitle ? normalizedTitle : undefined,
            pullRequestNumber: normalizedNumber ? normalizedNumber : undefined,
            hasSentSuggestions: hasSentSuggestionsParam,
        },
        { pageSize: 30 },
    );

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = loadMoreRef.current;

        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;

                if (
                    entry?.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            { rootMargin: "0px 0px 200px 0px" },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
        <Page.Root className="pb-0">
            <Page.Header className="max-w-full">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Page.Title>Pull Requests</Page.Title>

                        {pullRequests.length > 0 && (
                            <span className="flex gap-0.5 text-sm">
                                <span>Showing </span>
                                <span className="text-text-secondary">
                                    {pullRequests.length} pull request
                                    {pullRequests.length > 1 ? "s" : ""}
                                </span>
                                {selectedRepository && (
                                    <span className="text-text-secondary">
                                        {" "}
                                        from{" "}
                                        <span className="text-text-primary font-medium">
                                            {selectedRepository}
                                        </span>
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    <div className="ml-auto flex flex-wrap items-center gap-3">
                        <PullRequestsFilters
                            teamId={teamId}
                            selectedRepository={selectedRepository}
                            onRepositoryChange={setSelectedRepository}
                            pullRequestTitle={pullRequestTitle}
                            onTitleChange={(value) =>
                                setPullRequestTitle(value)
                            }
                            pullRequestNumber={pullRequestNumber}
                            onPullRequestNumberChange={(value) =>
                                setPullRequestNumber(
                                    value.replace(/[^\d]/g, ""),
                                )
                            }
                            suggestionsFilter={suggestionsFilter}
                            onSuggestionsFilterChange={(value) =>
                                setSuggestionsFilter(value)
                            }
                        />
                    </div>
                </div>
            </Page.Header>

            <Page.Content className="max-w-full px-6">
                {error ? (
                    <div className="py-12 text-center">
                        <p className="text-sm text-red-600">
                            Error loading pull requests. Please try again.
                        </p>
                    </div>
                ) : (
                    <>
                        <PrDataTable
                            data={pullRequests}
                            loading={isLoading && !pullRequests.length}
                        />
                        <div
                            ref={loadMoreRef}
                            className="h-6 w-full"
                            aria-hidden
                        />
                        {isFetchingNextPage && pullRequests.length > 0 && (
                            <div className="flex justify-center py-4">
                                <Spinner className="size-5" />
                            </div>
                        )}
                    </>
                )}
            </Page.Content>
        </Page.Root>
    );
}
