import type { Metadata } from "next";
import { GetStartedChecklist } from "@components/system/get-started-checklist";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { SettingsLayout } from "./_components/_layout";

export const metadata: Metadata = {
    title: "Code Review Settings",
    openGraph: { title: "Code Review Settings" },
};

export default async function Layout({ children }: React.PropsWithChildren) {
    const pluginsPageFeatureFlag = await getFeatureFlagWithPayload({
        feature: "plugins-page",
    });

    return (
        <SettingsLayout pluginsPageFeatureFlag={pluginsPageFeatureFlag}>
            {children}
            <GetStartedChecklist />
        </SettingsLayout>
    );
}
