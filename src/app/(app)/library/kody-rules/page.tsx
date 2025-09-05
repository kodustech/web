import type { Metadata } from "next";
import { getLibraryKodyRulesWithFeedback, getLibraryKodyRulesBuckets } from "@services/kodyRules/fetch";

import { KodyRulesLibrary } from "./_components/_page";

export const metadata: Metadata = {
    title: "Kody Rules library",
    openGraph: { title: "Kody Rules library" },
};

export default async function Route({
    searchParams,
}: {
    searchParams: Promise<{ bucket?: string }>;
}) {
    const params = await searchParams;
    
    const [rulesResponse, buckets] = await Promise.all([
        getLibraryKodyRulesWithFeedback({ 
            page: 1, 
            limit: 50,
            ...(params.bucket ? { buckets: [params.bucket] } : {})
        }),
        getLibraryKodyRulesBuckets(),
    ]);

    const rules = rulesResponse?.data || [];

    return <KodyRulesLibrary 
        rules={rules} 
        buckets={buckets} 
        initialSelectedBucket={params.bucket}
        pagination={{
            page: rulesResponse?.pagination?.currentPage || 1,
            limit: rulesResponse?.pagination?.itemsPerPage || 50,
            total: rulesResponse?.pagination?.totalItems || 0,
            totalPages: rulesResponse?.pagination?.totalPages || 1
        }}
    />;
}
