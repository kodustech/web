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
        console.log('Modal closed, redirecting to listing...');
        router.push(`/settings/code-review/${repositoryId}/kody-rules`);
    };

    console.log('Rendering modal directly for rule:', rule.title);

    // Renderizar o modal diretamente, como na library
    return (
        <KodyRuleAddOrUpdateItemModal
            rule={rule}
            repositoryId={repositoryId}
            onClose={handleClose}
        />
    );
} 