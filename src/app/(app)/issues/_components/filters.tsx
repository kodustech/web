"use client";

import { Fragment, use, useMemo, useState } from "react";
import { Button } from "@components/ui/button";
import { ButtonWithFeedback } from "@components/ui/button-with-feedback";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { Separator } from "@components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { useIssues } from "@services/issues/hooks";
import {
    CheckIcon,
    ListFilterIcon,
    PlusIcon,
    SaveIcon,
    TrashIcon,
    Undo2Icon,
    XCircleIcon,
    XIcon,
} from "lucide-react";
import { cn } from "src/core/utils/components";
import {
    isFilterValueGroup,
    type FilterValueGroup,
    type FilterValueItem,
    type Operator,
} from "src/core/utils/filtering";

import {
    COLUMNS_META_OBJECT,
    DEFAULT_FILTERS,
    deleteFiltersInLocalStorage,
    getFiltersInLocalStorage,
    saveFiltersToLocalStorage,
} from "../_constants";
import { FiltersContext } from "../_contexts/filters";

const FilterItemGroup = ({
    filters,
    setFilters,
    r = 0,
}: {
    filters: FilterValueGroup;
    setFilters: (filter: FilterValueGroup) => void;
    r?: number;
}) => {
    return (
        <div className="flex flex-col gap-2">
            {filters.items.map((filter, filterIndex) => {
                return (
                    <Fragment key={filterIndex}>
                        {filterIndex > 0 && (
                            <span
                                className={cn(
                                    "text-text-secondary text-[11px] font-semibold uppercase",
                                    r > 0 && "ml-2",
                                )}>
                                {filters.condition}
                            </span>
                        )}

                        <div>
                            {isFilterValueGroup(filter) ? (
                                // <div className="border-l-2 pl-3">
                                //     <FilterItemGroup filter={f} r={r + 1} />
                                // </div>
                                <></>
                            ) : (
                                <FilterItem
                                    filter={filter}
                                    setFilter={(newFilter) => {
                                        if (!newFilter) {
                                            return setFilters({
                                                ...filters,
                                                items: filters.items.filter(
                                                    (_, i) => i !== filterIndex,
                                                ),
                                            });
                                        }

                                        const updatedFilters =
                                            filters.items.map((f, i) => {
                                                if (i !== filterIndex) return f;

                                                return isFilterValueGroup(f)
                                                    ? f
                                                    : newFilter;
                                            });

                                        setFilters({
                                            ...filters,
                                            items: updatedFilters,
                                        });
                                    }}
                                />
                            )}
                        </div>
                    </Fragment>
                );
            })}

            <Button
                size="xs"
                variant="cancel"
                leftIcon={<PlusIcon />}
                className="button-disabled:bg-transparent button-disabled:text-text-tertiary mt-1 px-0"
                disabled={
                    filters.items.length === 0
                        ? false
                        : filters.items.some((f) => {
                              if (isFilterValueGroup(f)) return false;
                              return f.value.trim().length === 0;
                          })
                }
                onClick={() =>
                    setFilters({
                        ...filters,
                        items: [
                            ...filters.items,
                            {
                                field: "",
                                operator: "is",
                                value: "",
                            },
                        ],
                    })
                }>
                Add condition
            </Button>
        </div>
    );
};

const FilterItem = ({
    filter,
    setFilter,
}: {
    filter: FilterValueItem;
    setFilter: (f: FilterValueItem | undefined) => void;
}) => {
    const { data: issues } = useIssues();

    const OPERATORS_OPTIONS = Object.keys(
        COLUMNS_META_OBJECT[filter.field]?.meta?.filters ?? {},
    ) as Operator[];

    const values = useMemo(
        () => [
            ...new Set(
                issues.map((i) => {
                    const splittedByDots = filter.field.split(".");

                    if (splittedByDots.length === 1)
                        return i[filter.field as keyof typeof i];

                    return splittedByDots.reduce<any>(
                        (acc, current) => acc[current as keyof typeof acc],
                        i,
                    );
                }),
            ),
        ],
        [issues, filter],
    );

    return (
        <div className="flex items-center gap-2">
            <Select
                value={filter.field}
                onValueChange={(v) => {
                    let operator = filter.operator;
                    let value = filter.value;

                    const OPERATORS_OPTIONS = Object.keys(
                        COLUMNS_META_OBJECT[v]?.meta?.filters ?? {},
                    ) as Operator[];

                    if (!OPERATORS_OPTIONS.includes(filter.operator)) {
                        operator = OPERATORS_OPTIONS[0];
                    }

                    const values = [
                        ...new Set(
                            issues.map((i) => {
                                const splittedByDots = v.split(".");

                                if (splittedByDots.length === 1)
                                    return i[v as keyof typeof i];

                                return splittedByDots.reduce<any>(
                                    (acc, current) =>
                                        acc[current as keyof typeof acc],
                                    i,
                                );
                            }),
                        ),
                    ];

                    if (operator === "is" || operator === "is-not") {
                        value = values[0];
                    } else if (
                        operator === "contains" ||
                        operator === "does-not-contain"
                    ) {
                        value = operator === filter.operator ? value : "";
                    }

                    setFilter({ ...filter, operator, value, field: v });
                }}>
                <SelectTrigger size="xs" className="w-fit capitalize">
                    <SelectValue placeholder="Field" />
                </SelectTrigger>

                <SelectContent className="min-w-36">
                    {Object.entries(COLUMNS_META_OBJECT)
                        .filter(([, { meta }]) => meta?.filters)
                        .map(([s, { meta }]) => (
                            <SelectItem
                                key={s}
                                value={s}
                                className="min-h-auto gap-1.5 px-3 py-1.5 pr-4 text-xs capitalize [--icon-size:calc(var(--spacing)*4)]">
                                {meta?.name}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>

            {filter.field.length > 0 && (
                <Select
                    value={filter.operator}
                    onValueChange={(v) =>
                        setFilter({ ...filter, operator: v as Operator })
                    }>
                    <SelectTrigger size="xs" className="w-fit">
                        <SelectValue placeholder="Operator" />
                    </SelectTrigger>

                    <SelectContent className="min-w-36">
                        {OPERATORS_OPTIONS.map((o) => (
                            <SelectItem
                                key={o}
                                value={o}
                                className="min-h-auto gap-1.5 px-3 py-1.5 pr-4 text-xs [--icon-size:calc(var(--spacing)*4)]">
                                {o.replaceAll("-", " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {filter.field.length > 0 && (
                <>
                    {(filter.operator === "is" ||
                        filter.operator === "is-not") && (
                        <Select
                            value={filter.value}
                            onValueChange={(v) =>
                                setFilter({ ...filter, value: v })
                            }>
                            <SelectTrigger size="xs" className="w-fit">
                                <SelectValue placeholder="Value" />
                            </SelectTrigger>

                            <SelectContent className="min-w-36">
                                {values.map((s) => (
                                    <SelectItem
                                        key={s}
                                        value={s}
                                        className="min-h-auto gap-1.5 px-3 py-1.5 pr-4 text-xs [--icon-size:calc(var(--spacing)*4)]">
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {(filter.operator === "contains" ||
                        filter.operator === "does-not-contain") && (
                        <Input
                            className="h-7 w-32 rounded-full px-3 text-xs"
                            placeholder="Type something..."
                            value={filter.value ?? ""}
                            onChange={(ev) =>
                                setFilter({ ...filter, value: ev.target.value })
                            }
                        />
                    )}
                </>
            )}

            <div className="flex flex-1 justify-end">
                <Button
                    variant="cancel"
                    size="icon-xs"
                    onClick={() => setFilter(undefined)}>
                    <XIcon />
                </Button>
            </div>
        </div>
    );
};

export const IssuesFilters = () => {
    const { filters, setFilters } = use(FiltersContext);
    const [_localStorageFilters, _setLocalStorageFilters] = useState(
        getFiltersInLocalStorage(),
    );

    return (
        <Popover modal>
            <PopoverTrigger asChild>
                <Button
                    size="xs"
                    variant="helper"
                    leftIcon={<ListFilterIcon />}>
                    Filters{" "}
                    {filters.items.length > 0 && <>({filters.items.length})</>}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={10}
                className="flex w-fit min-w-88 flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListFilterIcon className="size-4" />
                        <Label>Filters</Label>
                    </div>

                    <div className="flex">
                        {_localStorageFilters?.items.length && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ButtonWithFeedback
                                        size="icon-sm"
                                        variant="cancel"
                                        data-disabled={undefined}
                                        onClick={() => {
                                            deleteFiltersInLocalStorage();
                                        }}
                                        onHideFeedback={() => {
                                            _setLocalStorageFilters(undefined);
                                        }}>
                                        <ButtonWithFeedback.Feedback>
                                            <XCircleIcon className="text-danger" />
                                        </ButtonWithFeedback.Feedback>

                                        <ButtonWithFeedback.Content>
                                            <TrashIcon />
                                        </ButtonWithFeedback.Content>
                                    </ButtonWithFeedback>
                                </TooltipTrigger>

                                <TooltipContent>
                                    Delete default filters
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ButtonWithFeedback
                                    size="icon-sm"
                                    variant="cancel"
                                    data-disabled={undefined}
                                    onClick={() => {
                                        saveFiltersToLocalStorage(filters);
                                    }}
                                    onHideFeedback={() => {
                                        _setLocalStorageFilters(filters);
                                    }}>
                                    <ButtonWithFeedback.Feedback>
                                        <CheckIcon className="text-success" />
                                    </ButtonWithFeedback.Feedback>

                                    <ButtonWithFeedback.Content>
                                        <SaveIcon />
                                    </ButtonWithFeedback.Content>
                                </ButtonWithFeedback>
                            </TooltipTrigger>

                            <TooltipContent>
                                Set as default filters
                            </TooltipContent>
                        </Tooltip>

                        <Separator
                            orientation="vertical"
                            className="bg-card-lv3 mx-1"
                        />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ButtonWithFeedback
                                    delay={800}
                                    size="icon-sm"
                                    variant="cancel"
                                    data-disabled={undefined}
                                    onClick={() => {
                                        setFilters(
                                            _localStorageFilters ??
                                                DEFAULT_FILTERS,
                                        );
                                    }}>
                                    <ButtonWithFeedback.Feedback>
                                        <CheckIcon className="text-success" />
                                    </ButtonWithFeedback.Feedback>

                                    <ButtonWithFeedback.Content>
                                        <Undo2Icon />
                                    </ButtonWithFeedback.Content>
                                </ButtonWithFeedback>
                            </TooltipTrigger>

                            <TooltipContent>
                                Reset to default filters
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div>
                    {filters.items.length > 0 && (
                        <span className="text-text-secondary text-[11px] font-semibold uppercase">
                            where
                        </span>
                    )}

                    <FilterItemGroup
                        filters={filters}
                        setFilters={setFilters}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
};
