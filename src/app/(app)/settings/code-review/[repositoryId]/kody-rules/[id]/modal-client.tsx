"use client";

import { useRouter } from "next/navigation";
import type { KodyRule } from "src/lib/services/kodyRules/types";

import { KodyRuleAddOrUpdateItemModal } from "../../../_components/pages/kody-rules/_components/modal";

export function KodyRuleModalClient({
    rule,
    repositoryId,
}: {
    rule: KodyRule;
    repositoryId: string;
}) {
    const router = useRouter();

    const handleClose = () => {
        router.push(`/settings/code-review/${repositoryId}/kody-rules`);
    };

    // Renderizar o modal diretamente, como na library
    return (
        <KodyRuleAddOrUpdateItemModal
            rule={rule}
            repositoryId={repositoryId}
            onClose={handleClose}
        />
    );
} 