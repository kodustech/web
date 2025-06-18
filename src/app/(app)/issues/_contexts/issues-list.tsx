"use client";

import { createContext } from "react";
import type { SeverityLevel } from "src/core/types";

type Issue = {
    contributingSuggestions: Array<Record<string, unknown>>;
    description: string;
    filePath: string;
    createdAt: string;
    language: string;
    repository: { name: string };
    representativeSuggestion: { id: string };
    severity: SeverityLevel;
    status: "open" | "closed";
    title: string;
    uuid: string;
    label: string;
};

export const IssuesListContext = createContext<Issue[]>([]);
