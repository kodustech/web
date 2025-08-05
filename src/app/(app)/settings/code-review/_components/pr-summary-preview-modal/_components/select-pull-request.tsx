"use client";

import { useMemo, useState } from "react";
import { SelectPullRequest } from "@components/system/select-pull-requests";
import { useSuspenseGetOnboardingPullRequests } from "@services/codeManagement/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

type PullRequest = Awaited<
    ReturnType<typeof useSuspenseGetOnboardingPullRequests>
>[number];

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

    // Buscar todos os PRs do time
    const allPullRequests = useSuspenseGetOnboardingPullRequests(teamId);

    // Filtrar PRs baseado no contexto

    const repositoryPullRequests = useMemo(() => {
        if (isGlobalConfig) {
            // Para configuração global, mostrar todos os PRs
            return allPullRequests;
        }

        // Para configuração de repositório específico, filtrar por repositório
        return allPullRequests.filter(
            (pr) =>
                pr.repository === repositoryName ||
                pr.repository === repositoryId,
        );
    }, [allPullRequests, isGlobalConfig, repositoryId, repositoryName]);

    return (
        <SelectPullRequest
            value={value}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            pullRequests={repositoryPullRequests}
            onChange={(pr) => {
                setDropdownOpen(false);
                onChange(pr);
            }}
        />
    );
};
