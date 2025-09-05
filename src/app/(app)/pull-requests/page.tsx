import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { PullRequestsPageClient } from "./_components/page.client";

export const metadata: Metadata = {
    title: "Pull Requests",
    openGraph: { title: "Pull Requests" },
};

export default async function PullRequestsPage() {
    const pullRequestsPageFeatureFlag = await getFeatureFlagWithPayload({
        feature: "pull-requests-pages",
    });

    if (!pullRequestsPageFeatureFlag?.value) {
        notFound();
        }

        return <PullRequestsPageClient />;
}
