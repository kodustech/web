"use client";

import { useSuspenseKodyRulesByRepositoryId } from "@services/kodyRules/hooks";
import { KodyRule, KodyRulesStatus } from "@services/kodyRules/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";

import { useCodeReviewRouteParams } from "../../../_hooks";
import { KodyRulesPage } from "./_components/_page";

export default function KodyRules() {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    const kodyRules = useSuspenseKodyRulesByRepositoryId(
        repositoryId,
        directoryId,
    );

    const globalRules =
        repositoryId !== "global"
            ? useSuspenseKodyRulesByRepositoryId("global")
            : [];

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

    const activeGlobalRules = globalRules.filter(
        (rule) => rule.status === KodyRulesStatus.ACTIVE,
    );

    return (
        <KodyRulesPage
            kodyRules={activeRules}
            globalRules={activeGlobalRules}
            pendingRules={pendingRules}
        />
    );
}
