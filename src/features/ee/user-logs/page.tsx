import { notFound } from "next/navigation";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { UserLogsPageClient } from "./_components/page.client";

export default async function UserLogsPage() {
    const logsPagesFeatureFlag = await getFeatureFlagWithPayload({
        feature: "logs-pages",
    });
    if (!logsPagesFeatureFlag?.value) notFound();

    return <UserLogsPageClient />;
}
