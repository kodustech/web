"use client";

import { createContext } from "react";

export const TableFilterContext = createContext<{
    query: string;
    setQuery: (q: string) => void;
}>({
    query: "",
    setQuery: () => {},
});
