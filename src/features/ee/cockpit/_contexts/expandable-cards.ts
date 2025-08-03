"use client";

import { createContext } from "react";

type ExpandableCards =
    | "lead-time-breakdown"
    | "pr-cycle-time"
    | "prs-opened-vs-closed"
    | "prs-merged-by-developer";

export const ExpandableCardsContext = createContext<{
    expanded: ExpandableCards | undefined;
    setExpanded: (expanded: ExpandableCards | undefined) => void;
}>({
    expanded: undefined,
    setExpanded: () => {},
});
