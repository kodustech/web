"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { getCodeHealthSuggestionsByRepository } from "src/features/ee/cockpit/_services/analytics/code-health/fetch";

type Type = Awaited<
    ReturnType<typeof getCodeHealthSuggestionsByRepository>
>[number];

export const columns: ColumnDef<Type>[] = [
    {
        accessorKey: "repository",
        header: "Repository",
    },
    {
        accessorKey: "security",
        header: "Security",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find((category) => category.category === "security")
                ?.count ?? "-",
    },
    {
        accessorKey: "error_handling",
        header: "Error Handling",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find(
                (category) => category.category === "error_handling",
            )?.count ?? "-",
    },
    {
        accessorKey: "kody_rules",
        header: "Kody Rules",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find(
                (category) => category.category === "kody_rules",
            )?.count ?? "-",
    },
    {
        accessorKey: "maintainability",
        header: "Maintainability",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find(
                (category) => category.category === "maintainability",
            )?.count ?? "-",
    },
    {
        accessorKey: "code_style",
        header: "Code Style",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find(
                (category) => category.category === "code_style",
            )?.count ?? "-",
    },
    {
        accessorKey: "potential_issues",
        header: "Potential Issues",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find(
                (category) => category.category === "potential_issues",
            )?.count ?? "-",
    },
    {
        accessorKey: "refactoring",
        header: "Refactoring",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find(
                (category) => category.category === "refactoring",
            )?.count ?? "-",
    },
    {
        accessorKey: "performance_and_optimization",
        header: "Performance/ Optimization",
        meta: { align: "center" },
        accessorFn: (row) =>
            row.categories.find(
                (category) =>
                    category.category === "performance_and_optimization",
            )?.count ?? "-",
    },
];
