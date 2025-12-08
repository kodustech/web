import { PropsWithChildren } from "react";
import { Page } from "@components/ui/page";
import { FEATURE_FLAGS } from "src/core/config/feature-flags";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { ConfigsSidebar } from "./_components/sidebar";

export default async function Layout(props: PropsWithChildren) {
    const ssoFeatureFlag = await getFeatureFlagWithPayload({
        feature: FEATURE_FLAGS.sso,
    });

    return (
        <div className="flex flex-1 flex-row overflow-hidden">
            <ConfigsSidebar
                featureFlags={{
                    sso:
                        (typeof ssoFeatureFlag?.value === "boolean"
                            ? ssoFeatureFlag.value
                            : false) ?? false,
                }}
            />
            <Page.WithSidebar>{props.children}</Page.WithSidebar>
        </div>
    );
}
