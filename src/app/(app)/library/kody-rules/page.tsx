import type { Metadata } from "next";
import { getLibraryKodyRules } from "@services/kodyRules/fetch";
import { getAllRulesWithLikes } from "@services/ruleLike/fetch";

import { KodyRulesLibrary } from "./_components/_page";

export const metadata: Metadata = {
    title: "Kody Rules library",
    openGraph: { title: "Kody Rules library" },
};

export default async function Route() {
    const [allRules, allRulesWithLikes] = await Promise.all([
        getLibraryKodyRules(),
        getAllRulesWithLikes(),
    ]);

    const rules = allRules.map((r) => {
        const likes = allRulesWithLikes.find((rl) => rl.ruleId === r.uuid);
        return {
            ...r,
            isLiked: likes?.userLiked ?? false,
            likesCount: likes?.likeCount ?? 0,
        };
    });

    return <KodyRulesLibrary rules={rules} />;
}
