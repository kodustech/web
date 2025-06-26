import { createContext } from "react";
import type { useQueryState } from "nuqs";
import type { FilterValueGroup } from "src/core/utils/filtering";

export const FiltersContext = createContext<{
    filters: FilterValueGroup;
    setFilters: ReturnType<typeof useQueryState<FilterValueGroup>>["1"];
}>(null as any);
