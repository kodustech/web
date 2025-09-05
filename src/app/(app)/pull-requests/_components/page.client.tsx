"use client";

import { useState } from "react";
import { Page } from "@components/ui/page";
import { usePullRequestExecutions } from "@services/pull-requests";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { PrDataTable } from "./pr-data-table";
import { RepositoryFilter } from "./repository-filter";

export function PullRequestsPageClient() {
    const { teamId } = useSelectedTeamId();
    const [selectedRepository, setSelectedRepository] = useState<string>();

    const {
        data: pullRequests,
        isLoading,
        error,
    } = usePullRequestExecutions({
        repositoryName: selectedRepository,
    });

    return (
        <Page.Root className="overflow-hidden pb-0">
            <Page.Header className="max-w-full">
                <div className="flex items-center justify-between w-full">
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
                    
                    <div className="flex-shrink-0 ml-auto">
                        <RepositoryFilter
                            teamId={teamId}
                            selectedRepository={selectedRepository}
                            onRepositoryChange={setSelectedRepository}
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
                    <PrDataTable data={pullRequests} loading={isLoading} />
                )}
            </Page.Content>
        </Page.Root>
    );
}
