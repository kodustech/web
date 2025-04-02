import { getKodyRulesByRepositoryId } from "@services/kodyRules/fetch";
import { KodyRule, KodyRulesStatus } from "@services/kodyRules/types";

import type { AutomationCodeReviewConfigPageProps } from "../types";
import { KodyRulesPage } from "./_components/_page";

export async function KodyRules(props: AutomationCodeReviewConfigPageProps) {
    const kodyRules = await getKodyRulesByRepositoryId(props.repositoryId, [
        "kody-rules-list",
    ]);

    const globalRules =
        props.repositoryId !== "global"
            ? await getKodyRulesByRepositoryId("global")
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
            {...props}
            kodyRules={activeRules}
            globalRules={activeGlobalRules}
            pendingRules={pendingRules}
        />
    );
}
