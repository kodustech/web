import { PropsWithChildren } from "react";
import { Page } from "@components/ui/page";
import { FEATURE_FLAGS } from "src/core/config/feature-flags";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { ConfigsSidebar } from "./_components/sidebar";

export default async function Layout(props: PropsWithChildren) {
    const [ssoFeatureFlag, cliKeysFeatureFlag] = await Promise.all([
        getFeatureFlagWithPayload({ feature: FEATURE_FLAGS.sso }),
        getFeatureFlagWithPayload({ feature: FEATURE_FLAGS.cliKeys }),
    ]);

    const ssoEnabled =
        typeof ssoFeatureFlag?.value === "boolean"
            ? ssoFeatureFlag.value
            : false;
    const cliKeysEnabled =
        typeof cliKeysFeatureFlag?.value === "boolean"
            ? cliKeysFeatureFlag.value
            : false;

    return (
        <div className="flex flex-1 flex-row overflow-hidden">
            <ConfigsSidebar
                featureFlags={{
                    [FEATURE_FLAGS.sso]: ssoEnabled,
                    [FEATURE_FLAGS.cliKeys]: cliKeysEnabled,
                }}
            />
            <Page.WithSidebar>{props.children}</Page.WithSidebar>
        </div>
    );
}
