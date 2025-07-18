import { GetStartedChecklist } from "@components/system/get-started-checklist";
import { getAutomationsByTeamId } from "@services/automations/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";

import { AutomationCodeReviewLayout } from "./code-review/_components/_layout";

export const metadata = {
    title: "Code Review Settings",
    openGraph: { title: "Code Review Settings" },
};

export default async function Layout({ children }: React.PropsWithChildren) {
    const teamId = await getGlobalSelectedTeamId();
    const [automations, pluginsPageFeatureFlag] = await Promise.all([
        getAutomationsByTeamId(teamId),
        getFeatureFlagWithPayload({ feature: "plugins-page" }),
    ]);

    const automation = automations?.find(
        ({ automation }) =>
            automation.automationType === "AutomationCodeReview",
    );

    return (
        <AutomationCodeReviewLayout
            automation={automation}
            teamId={teamId}
            pluginsPageFeatureFlag={pluginsPageFeatureFlag}>
            {children}
            <GetStartedChecklist />
        </AutomationCodeReviewLayout>
    );
}
