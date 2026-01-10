import type { Metadata } from "next";
import { FEATURE_FLAGS } from "src/core/config/feature-flags";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { SettingsLayout } from "./_components/_layout";

export const metadata: Metadata = {
    title: "Code Review Settings",
    openGraph: { title: "Code Review Settings" },
};

export default async function Layout({ children }: React.PropsWithChildren) {
    const codeReviewDryRunFeatureFlag = await getFeatureFlagWithPayload({
        feature: FEATURE_FLAGS.codeReviewDryRun,
    });

    return (
        <SettingsLayout
            codeReviewDryRunFeatureFlag={codeReviewDryRunFeatureFlag?.value}>
            {children}
        </SettingsLayout>
    );
}
