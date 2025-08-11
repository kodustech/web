import type { Metadata } from "next";
import { GetStartedChecklist } from "@components/system/get-started-checklist";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { AutomationCodeReviewLayout } from "./code-review/_components/_layout";

export const metadata: Metadata = {
    title: "Code Review Settings",
    openGraph: { title: "Code Review Settings" },
};

export default async function Layout({ children }: React.PropsWithChildren) {
    const pluginsPageFeatureFlag = await getFeatureFlagWithPayload({
        feature: "plugins-page",
    });

    return (
        <AutomationCodeReviewLayout
            pluginsPageFeatureFlag={pluginsPageFeatureFlag}>
            {children}
            <GetStartedChecklist />
        </AutomationCodeReviewLayout>
    );
}
