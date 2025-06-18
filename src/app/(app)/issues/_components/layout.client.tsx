"use client";

import { IssuesListContext } from "../_contexts/issues-list";

export const IssuesLayoutClient = ({
    children,
    issues,
}: {
    children: React.ReactNode;
    issues: React.ContextType<typeof IssuesListContext>;
}) => <IssuesListContext value={issues}>{children}</IssuesListContext>;
