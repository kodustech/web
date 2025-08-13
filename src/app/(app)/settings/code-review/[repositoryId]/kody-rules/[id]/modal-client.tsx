"use client";

import { useRouter } from "next/navigation";
import { KODY_RULES_PATHS } from "@services/kodyRules";
import { useQueryClient } from "@tanstack/react-query";
import { addSearchParamsToUrl } from "src/core/utils/url";
import type { KodyRule } from "src/lib/services/kodyRules/types";

import { useFullCodeReviewConfig } from "../../../_components/context";
import { KodyRuleAddOrUpdateItemModal } from "../../../_components/modal";

export function KodyRuleModalClient({
    rule,
    repositoryId,
    directoryId,
}: {
    rule: KodyRule;
    repositoryId: string;
    directoryId?: string;
}) {
    const router = useRouter();
    const config = useFullCodeReviewConfig();
    const queryClient = useQueryClient();

    const handleClose = async () => {
        await queryClient.resetQueries({
            predicate: (query) =>
                query.queryKey[0] ===
                KODY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER,
        });

        router.push(
            addSearchParamsToUrl(
                `/settings/code-review/${repositoryId}/kody-rules`,
                { directoryId },
            ),
        );
    };

    const directory = config?.repositories
        .find((r) => r.id === repositoryId)
        ?.directories?.find((d) => d.id === directoryId);

    return (
        <KodyRuleAddOrUpdateItemModal
            rule={rule}
            onClose={handleClose}
            directory={directory}
            repositoryId={repositoryId}
        />
    );
}
