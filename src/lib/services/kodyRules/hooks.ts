import { useSuspenseFetch } from "src/core/utils/reactQuery";

import { KODY_RULES_PATHS } from ".";
import type { LibraryRule } from "./types";

export const useSuspenseFindLibraryKodyRules = () => {
    const rules = useSuspenseFetch<Record<string, Array<LibraryRule>>>(
        KODY_RULES_PATHS.FIND_LIBRARY_KODY_RULES,
    );

    return Object.values(rules).flat();
};
