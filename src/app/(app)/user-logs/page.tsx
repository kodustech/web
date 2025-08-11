import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserLogs } from "@services/userLogs/fetch";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { UserLogsPageClient } from "./_components/page.client";

export const metadata: Metadata = {
    title: "User Activity Logs",
    openGraph: { title: "User Activity Logs" },
};

export default async function UserLogsPage() {
    const logsPagesFeatureFlag = await getFeatureFlagWithPayload({
        feature: "logs-pages",
    });

    if (!logsPagesFeatureFlag?.value) {
        notFound();
    }

    const logsData = await getUserLogs();

    return <UserLogsPageClient data={logsData} />;
}
