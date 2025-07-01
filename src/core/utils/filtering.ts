export type Operator =
    | "is"
    | "is-not"
    | "contains"
    | "does-not-contain"
    | "more-than"
    | "less-than";

export type FilterValueItem = {
    field: string;
    operator: Operator;
    value: string;
};

export type FilterValueGroup = {
    condition: "and" | "or";
    items: Array<FilterValueGroup | FilterValueItem>;
};

export const isFilterValueItem = (
    item: FilterValueGroup | FilterValueItem,
): item is FilterValueItem => "operator" in item;

export const isFilterValueGroup = (
    item: FilterValueGroup | FilterValueItem,
): item is FilterValueGroup => "condition" in item;

/* --------------------------------------------------------------------- */

export const AND = (...preds: Array<boolean>) => preds.every((p) => p);
export const OR = (...preds: Array<boolean>) => preds.some((p) => p);

/* --------------------------------------------------------------------- */

export const filterArray = <T extends Record<string, any>>(
    filters: FilterValueGroup,
    items: T[],
): T[] => items.filter((obj) => filterItem(filters, obj));

const filterItem = <T extends Record<string, any>>(
    filters: FilterValueGroup,
    obj: T,
): T | undefined => {
    if (filters.items.length === 0) return obj;

    const predicate = (f: (typeof filters.items)[number]) =>
        isFilterValueGroup(f)
            ? filterItem(f, obj) !== undefined
            : isValueValid(obj)(f);

    if (
        filters.condition === "and" &&
        AND(...filters.items.map((f) => predicate(f)))
    ) {
        return obj;
    }

    if (
        filters.condition === "or" &&
        OR(...filters.items.map((f) => predicate(f)))
    ) {
        return obj;
    }
};

const isValueValid = <T extends Record<string, any>>(
    obj: T,
): ((f: FilterValueItem) => boolean) => {
    return (f) => {
        let fieldValue = obj[f.field];
        const splittedByDots = f.field.split(".");

        if (splittedByDots.length > 1) {
            fieldValue = splittedByDots.reduce(
                (acc, current) => acc?.[current],
                obj,
            );
        }

        const searchQuery = f.value?.toLowerCase();
        if (!searchQuery || searchQuery.trim().length === 0) return true;

        const searchQuerySplittedByComma = searchQuery
            .split(",")
            .map((s) => s.trim());

        if (f.operator === "contains") {
            if (Array.isArray(fieldValue)) {
                return (fieldValue as any[]).some((v) =>
                    searchQuerySplittedByComma.includes(
                        String(v).toLowerCase(),
                    ),
                );
            }

            return String(fieldValue).toLowerCase().includes(searchQuery);
        }

        if (f.operator === "does-not-contain") {
            if (Array.isArray(fieldValue)) {
                return (fieldValue as any[]).every(
                    (v) =>
                        !searchQuerySplittedByComma.includes(
                            String(v).toLowerCase(),
                        ),
                );
            }

            return !String(fieldValue).toLowerCase().includes(searchQuery);
        }

        if (f.operator === "is")
            return String(fieldValue).toLowerCase() === searchQuery;

        if (f.operator === "is-not")
            return String(fieldValue).toLowerCase() !== searchQuery;

        if (f.operator === "less-than")
            return Number(fieldValue) > Number(searchQuery);

        if (f.operator === "more-than")
            return Number(fieldValue) < Number(searchQuery);

        return true;
    };
};
