import { redirect } from "next/navigation";
import { EmptyComponent } from "@components/ui/empty";
import { getAutomationsByTeamId } from "@services/automations/fetch";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";

import automationConfigPages from "../_components/pages";

export default async function Page({
    params,
}: {
    params: Promise<{ params: [string, ...string[]] }>;
}) {
    const teamId = await getGlobalSelectedTeamId();
    const automations = await getAutomationsByTeamId(teamId);
    const pageParams = await params;

    const {
        params: [repository, ...segments],
    } = { params: pageParams.params ?? [] };

    const pageName = segments.join("/");

    if (!segments.length)
        redirect(`/settings/code-review/${repository}/general`);

    if (
        !automationConfigPages[pageName as keyof typeof automationConfigPages]
    ) {
        redirect(`/settings/code-review/${repository}/general`);
    }

    const PageComponent =
        automationConfigPages[pageName as keyof typeof automationConfigPages] ||
        EmptyComponent;

    const automation = automations?.find(
        ({ automation: { automationType } }) =>
            automationType === "AutomationCodeReview",
    );

    if (!automation) redirect("/");

    return <PageComponent automation={automation} repositoryId={repository} />;
}
