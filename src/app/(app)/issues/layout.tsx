import { getIssues } from "@services/issues/fetch";

import { IssuesLayoutClient } from "./_components/layout.client";

export default async function Layout({
    children,
    modal,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    const issues = await getIssues();

    return (
        <IssuesLayoutClient issues={issues}>
            {children}
            {modal}
        </IssuesLayoutClient>
    );
}
