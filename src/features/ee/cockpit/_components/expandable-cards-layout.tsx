"use client";

import { useState } from "react";
import { useShortcut } from "@hooks/use-shortcut";

import { ExpandableCardsContext } from "../_contexts/expandable-cards";

export const ExpandableCardsLayout = ({
    children,
}: React.PropsWithChildren) => {
    const [expanded, setExpanded] =
        useState<
            React.ContextType<typeof ExpandableCardsContext>["expanded"]
        >();

    useShortcut("Escape", () => setExpanded(undefined), {
        enabled: expanded !== undefined,
    });

    return (
        <ExpandableCardsContext value={{ expanded, setExpanded }}>
            {children}
        </ExpandableCardsContext>
    );
};
