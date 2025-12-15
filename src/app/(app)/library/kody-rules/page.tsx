import type { Metadata } from "next";
import { getLibraryKodyRulesWithFeedback, getLibraryKodyRulesBuckets } from "@services/kodyRules/fetch";
import { getOrganizationLanguage } from "@services/organizations/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { KodyRulesLibrary } from "./_components/_page";

export const metadata: Metadata = {
    title: "Kody Rules library",
    openGraph: { title: "Kody Rules library" },
};

const BUCKETS_PREVIEW_COUNT = 3;
const BUCKET_RULES_PREVIEW_LIMIT = 6;

export default async function Route({
    searchParams,
}: {
    searchParams: Promise<{ bucket?: string; view?: string; type?: string }>;
}) {
    const params = await searchParams;

    const initialTags = params.type === "mcp" ? ["MCP"] : undefined;
    const initialPlugAndPlay = params.type === "plug-and-play";

    const teamId = await getGlobalSelectedTeamId();

    const [buckets, orgLanguage] = await Promise.all([
        getLibraryKodyRulesBuckets(),
        getOrganizationLanguage(teamId),
    ]);
    const previewBuckets = [...buckets]
        .sort((a, b) => b.rulesCount - a.rulesCount)
        .slice(0, BUCKETS_PREVIEW_COUNT);

    const [bucketRulesResponse, bucketPreviews] = await Promise.all([
        params.bucket
            ? getLibraryKodyRulesWithFeedback({
                  page: 1,
                  limit: 48,
                  buckets: [params.bucket],
                  tags: initialTags,
                  plug_and_play: initialPlugAndPlay || undefined,
              })
            : Promise.resolve(null),
        Promise.all(
            previewBuckets.map(async (bucket) => {
                const response = await getLibraryKodyRulesWithFeedback({
                    page: 1,
                    limit: BUCKET_RULES_PREVIEW_LIMIT,
                    buckets: [bucket.slug],
                });

                return { bucket, rules: response?.data || [] };
            }),
        ),
    ]);

    return (
        <KodyRulesLibrary
            buckets={buckets}
            bucketPreviews={bucketPreviews}
            initialSelectedBucket={params.bucket}
            initialView={
                params.view === "browse" || params.type ? "browse" : undefined
            }
            initialTags={initialTags}
            initialPlugAndPlay={initialPlugAndPlay || undefined}
            teamLanguage={orgLanguage?.language}
            initialRules={bucketRulesResponse?.data || []}
            pagination={{
                page: bucketRulesResponse?.pagination?.currentPage || 1,
                limit: bucketRulesResponse?.pagination?.itemsPerPage || 48,
                total: bucketRulesResponse?.pagination?.totalItems || 0,
                totalPages: bucketRulesResponse?.pagination?.totalPages || 1,
            }}
        />
    );
}
