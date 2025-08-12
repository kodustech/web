import { redirect } from "next/navigation";
import { getKodyRulesByRepositoryId } from "@services/kodyRules/fetch";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { KodyRuleModalClient } from "./modal-client";

export default async function KodyRuleDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ repositoryId: string; id: string }>;
    searchParams: Promise<{ directoryId: string }>;
}) {
    try {
        // Await params first (Next.js 15 requirement)
        const { repositoryId, id } = await params;
        const { directoryId } = await searchParams;

        const kodyRules = await getKodyRulesByRepositoryId(
            repositoryId,
            directoryId,
        );
        const globalRules =
            repositoryId !== "global"
                ? await getKodyRulesByRepositoryId("global")
                : [];

        const rule = [...kodyRules, ...globalRules].find((r) => r.uuid === id);

        if (!rule) {
            const url = addSearchParamsToUrl(
                `/settings/code-review/${repositoryId}/kody-rules`,
                { directoryId },
            );
            redirect(url);
        }

        return (
            <KodyRuleModalClient
                rule={rule}
                repositoryId={repositoryId}
                directoryId={directoryId}
            />
        );
    } catch (error) {
        console.error("Error loading rule:", error);
        redirect("/settings/code-review");
    }
}
