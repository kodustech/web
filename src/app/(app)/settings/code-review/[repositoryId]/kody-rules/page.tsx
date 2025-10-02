"use client";

import {
    useSuspenseGetInheritedKodyRules,
    useSuspenseKodyRulesByRepositoryId,
} from "@services/kodyRules/hooks";
import { KodyRule, KodyRulesStatus } from "@services/kodyRules/types";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { useCodeReviewRouteParams } from "../../../_hooks";
import { KodyRulesPage } from "./_components/_page";

export default function KodyRules() {
    const { teamId } = useSelectedTeamId();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    const kodyRules = useSuspenseKodyRulesByRepositoryId(
        repositoryId,
        directoryId,
    );

    const {
        directoryRules = [],
        globalRules = [],
        repoRules = [],
    } = useSuspenseGetInheritedKodyRules({
        teamId,
        repositoryId,
        directoryId,
    });

    const { activeRules, pendingRules } = kodyRules.reduce<{
        activeRules: KodyRule[];
        pendingRules: KodyRule[];
    }>(
        (result, rule) => {
            switch (rule.status) {
                case KodyRulesStatus.ACTIVE:
                    result.activeRules.push(rule);
                    break;
                case KodyRulesStatus.PENDING:
                    result.pendingRules.push(rule);
                    break;
            }
            return result;
        },
        { activeRules: [], pendingRules: [] },
    );

    return (
        <KodyRulesPage
            kodyRules={activeRules}
            pendingRules={pendingRules}
            inheritedDirectoryRules={directoryRules}
            inheritedGlobalRules={globalRules}
            inheritedRepoRules={repoRules}
        />
    );
}
