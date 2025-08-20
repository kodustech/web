"use client";

import { Fragment } from "react";
import { Button } from "@components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { PlusIcon } from "lucide-react";
import { cn } from "src/core/utils/components";
import {
    isFilterValueGroup,
    type FilterValueGroup,
} from "src/core/utils/filtering";

import { FilterItem } from "./item";

export const FilterItemGroup = ({
    filters,
    setFilters,
    r = 0,
}: {
    filters: FilterValueGroup;
    setFilters: (filter: FilterValueGroup) => void;
    r?: number;
}) => {
    return (
        <div className="flex flex-col gap-1">
            {r === 0 && filters.items.length > 0 && (
                <span className="text-text-secondary text-[11px] font-semibold uppercase">
                    where
                </span>
            )}

            {filters.items.map((filter, filterIndex) => {
                return (
                    <Fragment key={filterIndex}>
                        {filterIndex > 1 && (
                            <span className="text-text-secondary px-2 text-[11px] font-bold uppercase">
                                {filters.condition}
                            </span>
                        )}

                        {filterIndex === 1 && (
                            <Select
                                value={filters.condition}
                                onValueChange={(v) => {
                                    setFilters({
                                        ...filters,
                                        condition:
                                            v as FilterValueGroup["condition"],
                                    });
                                }}>
                                <SelectTrigger
                                    size="xs"
                                    className={cn(
                                        "text-text-secondary h-5 min-h-auto w-fit gap-0.5 bg-transparent px-2 text-[11px] uppercase ring-0",
                                        "[--icon-size:calc(var(--spacing)*3.5)] **:[span]:font-bold",
                                    )}>
                                    <SelectValue placeholder="Condition" />
                                </SelectTrigger>

                                <SelectContent className="min-w-20">
                                    {["or", "and"].map((o) => (
                                        <SelectItem
                                            key={o}
                                            value={o}
                                            className="min-h-auto gap-1.5 px-3 py-1.5 pr-4 text-xs uppercase [--icon-size:calc(var(--spacing)*4)]">
                                            {o}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <div>
                            {isFilterValueGroup(filter) ? (
                                <div className="bg-card-lv3/25 rounded-r-xl border-l-2 px-3 py-2">
                                    <FilterItemGroup
                                        r={r + 1}
                                        filters={filter}
                                        setFilters={(newFilter) => {
                                            if (newFilter.items.length === 0) {
                                                return setFilters({
                                                    ...filters,
                                                    items: filters.items.filter(
                                                        (_, i) =>
                                                            i !== filterIndex,
                                                    ),
                                                });
                                            }

                                            setFilters({
                                                ...filters,
                                                items: filters.items.map(
                                                    (_, i) =>
                                                        i === filterIndex
                                                            ? newFilter
                                                            : _,
                                                ),
                                            });
                                        }}
                                    />
                                </div>
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
                                            filters.items.map((f, i) =>
                                                i !== filterIndex ||
                                                isFilterValueGroup(f)
                                                    ? f
                                                    : newFilter,
                                            );

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

            <div
                className={cn(
                    "mt-1 flex items-center gap-4",
                    r === 0 && "-mb-1",
                )}>
                <Button
                    size="xs"
                    variant="cancel"
                    leftIcon={<PlusIcon />}
                    className="button-disabled:bg-transparent button-disabled:text-text-tertiary px-0"
                    disabled={
                        filters.items.length === 0
                            ? false
                            : filters.items.some((f) => {
                                  if (isFilterValueGroup(f)) return false;
                                  return f.value?.trim().length === 0;
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

                {r === 0 ? (
                    <Button
                        size="xs"
                        variant="cancel"
                        leftIcon={<PlusIcon />}
                        className="button-disabled:bg-transparent button-disabled:text-text-tertiary px-0"
                        disabled={
                            filters.items.length === 0
                                ? false
                                : filters.items.some((f) => {
                                      if (isFilterValueGroup(f)) return false;
                                      return f.value?.trim().length === 0;
                                  })
                        }
                        onClick={() =>
                            setFilters({
                                ...filters,
                                items: [
                                    ...filters.items,
                                    {
                                        condition: "or",
                                        items: [
                                            {
                                                field: "",
                                                operator: "is",
                                                value: "",
                                            },
                                        ],
                                    },
                                ],
                            })
                        }>
                        Add group
                    </Button>
                ) : (
                    <div className="flex flex-1 justify-end">
                        <Button
                            size="xs"
                            variant="cancel"
                            className="text-tertiary-light h-full min-h-auto px-0"
                            onClick={() => {
                                setFilters({ ...filters, items: [] });
                            }}>
                            Delete group
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
