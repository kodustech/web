"use client";

import { Badge } from "@components/ui/badge";
import { useSuspenseIssuesCount } from "@services/issues/hooks";

export const IssuesCount = () => {
    const count = useSuspenseIssuesCount();

    return (
        <Badge
            variant="secondary"
            className="pointer-events-none h-full min-h-auto w-full px-2">
            {count}
        </Badge>
    );
};
