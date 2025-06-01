import { redirect } from "next/navigation";
import { getKodyRulesByRepositoryId } from "@services/kodyRules/fetch";
import { KodyRulesStatus } from "@services/kodyRules/types";

import { KodyRuleModalClient } from "./modal-client";

export default async function KodyRuleDetailPage({
    params,
}: {
    params: Promise<{ repositoryId: string; id: string }>;
}) {
    try {
        // Await params first (Next.js 15 requirement)
        const { repositoryId, id } = await params;
        
        // Buscar todas as regras para encontrar a específica (SERVER SIDE)
        const kodyRules = await getKodyRulesByRepositoryId(repositoryId);
        const globalRules = repositoryId !== "global" 
            ? await getKodyRulesByRepositoryId("global") 
            : [];

        // Encontrar a regra específica
        const rule = [...kodyRules, ...globalRules].find(r => r.uuid === id);
        
        if (!rule) {
            // Regra não encontrada, redirect para listagem
            redirect(`/settings/code-review/${repositoryId}/kody-rules`);
        }

        // Passar a regra para o client component
        return (
            <KodyRuleModalClient
                rule={rule}
                repositoryId={repositoryId}
            />
        );
    } catch (error) {
        console.error('Error loading rule:', error);
        // Se der erro, tentar fazer redirect genérico
        redirect('/settings/code-review');
    }
} 