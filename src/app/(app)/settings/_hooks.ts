"use client";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import type { LiteralUnion } from "src/core/types";

import { FormattedConfigLevel } from "./code-review/_types";

export const useCodeReviewRouteParams = (): {
    repositoryId: LiteralUnion<"global">;
    directoryId?: string;
    pageName: string;
} => {
    const pathname = usePathname();
    const { repositoryId } = useParams<{
        repositoryId: LiteralUnion<"global">;
    }>();

    // route always follows `/settings/code-review/[repositoryId]/{pageName}` pattern
    const pageName = pathname.split("/")[4];

    const searchParams = useSearchParams();
    const directoryId = searchParams.get("directoryId") ?? undefined;

    return { repositoryId, directoryId, pageName };
};

export const useCurrentConfigLevel = (): FormattedConfigLevel => {
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    if (repositoryId === "global") {
        return FormattedConfigLevel.GLOBAL;
    }

    if (directoryId) {
        return FormattedConfigLevel.DIRECTORY;
    }

    return FormattedConfigLevel.REPOSITORY;
};
