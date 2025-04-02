import { getAutomationsByTeamId } from "@services/automations/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import { AutomationCodeReviewLayout } from "./code-review/_components/_layout";

export const metadata = {
    title: "Code Review Settings",
};

export default async function Layout({ children }: React.PropsWithChildren) {
    const teamId = await getGlobalSelectedTeamId();
    const automations = await getAutomationsByTeamId(teamId);

    const automation = automations?.find(
        ({ automation }) =>
            automation.automationType === "AutomationCodeReview",
    );

    return (
        <AutomationCodeReviewLayout automation={automation} teamId={teamId}>
            {children}
        </AutomationCodeReviewLayout>
    );
}
