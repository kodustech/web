"use client";

import { useState } from "react";
import { SelectPullRequestWithServerSearch } from "@components/system/select-pull-requests-server-search";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

type PullRequest = {
    id: string;
    pull_number: number;
    repository: string;
    title: string;
    url: string;
};

export const PRSummaryPreviewSelectRepositories = ({
    value,
    onChange,
    isGlobalConfig,
    repositoryId,
    repositoryName,
}: {
    repositoryId: string;
    repositoryName: string;
    isGlobalConfig: boolean;
    value: PullRequest | undefined;
    onChange: (pr: PullRequest) => void;
}) => {
    const { teamId } = useSelectedTeamId();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Determinar repositoryId para filtrar no server-side
    const searchRepositoryId = isGlobalConfig ? undefined : repositoryId;

    return (
        <SelectPullRequestWithServerSearch
            value={value}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            teamId={teamId}
            repositoryId={searchRepositoryId}
            onChange={(pr) => {
                setDropdownOpen(false);
                onChange(pr);
            }}
        />
    );
};
