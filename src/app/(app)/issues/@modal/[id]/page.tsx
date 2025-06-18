import { getIssue } from "@services/issues/fetch";

import { RightSheet } from "./_components/right-sheet";

export default async function IssueItemPage(context: {
    params: Promise<{ id: string }>;
}) {
    const params = await context.params;
    const issue = await getIssue({ id: params.id });
    return <RightSheet issue={issue} issueId={params.id} />;
}
