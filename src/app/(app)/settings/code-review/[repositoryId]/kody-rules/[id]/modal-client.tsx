"use client";

import { useRouter } from "next/navigation";
import { applySearchParamsToUrl } from "src/core/utils/url";
import type { KodyRule } from "src/lib/services/kodyRules/types";

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

    const handleClose = () => {
        const url = applySearchParamsToUrl(
            `/settings/code-review/${repositoryId}/kody-rules`,
            { directoryId },
        );

        router.push(url);
    };

    // Renderizar o modal diretamente, como na library
    return (
        <KodyRuleAddOrUpdateItemModal
            rule={rule}
            repositoryId={repositoryId}
            directoryId={directoryId}
            onClose={handleClose}
        />
    );
}
