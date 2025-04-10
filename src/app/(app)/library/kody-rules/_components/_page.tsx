"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@components/ui/command";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Input } from "@components/ui/input";
import { KodyRuleLibraryItem } from "@components/ui/kody-rules/library-item-card";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { Separator } from "@components/ui/separator";
import { toast } from "@components/ui/toaster/use-toast";
import type {
    FindLibraryKodyRulesFilters,
    LibraryRule,
} from "@services/kodyRules/types";
import { ArrowLeft, Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { cn } from "src/core/utils/components";
import { revalidateServerSideTag } from "src/core/utils/revalidate-server-side";
import { pluralize } from "src/core/utils/string";

const DEFAULT_FILTERS: FindLibraryKodyRulesFilters = {
    name: "",
    tags: [],
};

export const KodyRulesLibrary = ({
    rules,
    configValue,
}: {
    rules: LibraryRule[];
    configValue: {
        repositories: Array<{
            id: string;
            name: string;
            isSelected?: boolean;
        }>;
    };
}) => {
    const router = useRouter();

    const [filters, setFilters] =
        useState<FindLibraryKodyRulesFilters>(DEFAULT_FILTERS);

    const filteredRules = useMemo(() => {
        let results = rules;

        if (filters.name?.length) {
            results = results?.filter((r) =>
                r.title.toLowerCase().includes(filters.name!.toLowerCase()),
            );
        }

        if (filters.tags?.length) {
            results = results?.filter((r) =>
                filters.tags!.every((tag) => r.tags.includes(tag)),
            );
        }

        if (filters?.severity) {
            results = results?.filter((r) => r.severity === filters.severity);
        }

        if (filters?.language) {
            results = results?.filter((r) => r.language === filters.language);
        }

        return results;
    }, [filters]);

    const tags = useMemo(() => {
        const tags = new Set<string>();
        rules?.forEach((r) => r?.tags?.forEach((t) => tags.add(t)));
        return Array.from(tags);
    }, [rules]);

    return (
        <Page.Root>
            <Page.Header>
                <div className="flex flex-col gap-1">
                    <Button
                        className="mb-4 text-xs"
                        leftIcon={<ArrowLeft />}
                        variant="link"
                        onClick={router.back}>
                        Go back to Kody Rules
                    </Button>

                    <Page.Title className="text-2xl font-semibold">
                        Discovery Rules
                    </Page.Title>
                    <p className="text-sm text-muted-foreground">
                        Import automated rules and guidelines for your code
                        reviews.
                    </p>
                </div>
            </Page.Header>

            <Page.Header>
                <div className="flex w-full flex-col gap-3">
                    <div className="flex flex-row items-center justify-between gap-4">
                        <Heading variant="h3">Filter by</Heading>
                        <Link
                            href=""
                            className="text-xs"
                            onClick={(e) => {
                                e.preventDefault();
                                setFilters(DEFAULT_FILTERS);
                            }}
                            disabled={
                                !filters.name?.length &&
                                !filters.tags?.length &&
                                !filters.severity &&
                                !filters.language
                            }>
                            Clear all
                        </Link>
                    </div>

                    <div className="flex flex-row items-end gap-4">
                        <FormControl.Root className="flex-2">
                            <FormControl.Label htmlFor="name">
                                Name
                            </FormControl.Label>

                            <FormControl.Input>
                                <div className="relative flex-1">
                                    <Input
                                        className="h-10 pl-12"
                                        value={filters.name}
                                        id="name"
                                        placeholder="Search rules by name"
                                        onChange={(e) =>
                                            setFilters((filters) => ({
                                                ...filters,
                                                name: e.target.value,
                                            }))
                                        }
                                    />

                                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                        <SearchIcon className="size-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </FormControl.Input>
                        </FormControl.Root>

                        <FormControl.Root className="flex-1">
                            <FormControl.Label htmlFor="severity">
                                Severity
                            </FormControl.Label>

                            <FormControl.Input>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            id="severity"
                                            className="h-10 justify-between">
                                            {filters.severity ? (
                                                filters.severity
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Select
                                                </span>
                                            )}
                                            <ChevronsUpDown className="size-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        align="start"
                                        className="w-[var(--radix-popover-trigger-width)] p-0">
                                        <Command>
                                            <CommandList>
                                                <CommandGroup>
                                                    {[
                                                        "Low",
                                                        "Medium",
                                                        "High",
                                                        "Critical",
                                                    ].map((v) => (
                                                        <CommandItem
                                                            key={v}
                                                            value={v}
                                                            onSelect={() => {
                                                                setFilters(
                                                                    (
                                                                        filters,
                                                                    ) => ({
                                                                        ...filters,
                                                                        severity:
                                                                            v ===
                                                                            filters.severity
                                                                                ? undefined
                                                                                : (v as typeof filters.severity),
                                                                    }),
                                                                );
                                                            }}>
                                                            {v}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto size-4 text-brand-orange",
                                                                    filters.severity ===
                                                                        v
                                                                        ? "opacity-100"
                                                                        : "opacity-0",
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </FormControl.Input>
                        </FormControl.Root>

                        <FormControl.Root className="flex-1">
                            <FormControl.Label htmlFor="language">
                                Language
                            </FormControl.Label>

                            <FormControl.Input>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            id="language"
                                            className="h-10 justify-between">
                                            {filters.language ? (
                                                ProgrammingLanguage[
                                                    filters.language
                                                ]
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Select
                                                </span>
                                            )}
                                            <ChevronsUpDown className="size-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        align="start"
                                        className="w-[var(--radix-popover-trigger-width)] p-0">
                                        <Command>
                                            <CommandList>
                                                <CommandGroup>
                                                    {Object.entries(
                                                        ProgrammingLanguage,
                                                    ).map(([k, v]) => (
                                                        <CommandItem
                                                            key={k}
                                                            value={k}
                                                            onSelect={() => {
                                                                setFilters(
                                                                    (
                                                                        filters,
                                                                    ) => ({
                                                                        ...filters,
                                                                        language:
                                                                            k ===
                                                                            filters.language
                                                                                ? undefined
                                                                                : (k as typeof filters.language),
                                                                    }),
                                                                );
                                                            }}>
                                                            {v}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto size-4 text-brand-orange",
                                                                    filters.language ===
                                                                        k
                                                                        ? "opacity-100"
                                                                        : "opacity-0",
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </FormControl.Input>
                        </FormControl.Root>

                        <FormControl.Root className="flex-1">
                            <FormControl.Label htmlFor="tags">
                                Tags
                            </FormControl.Label>

                            <FormControl.Input>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            id="tags"
                                            className="h-10 justify-between">
                                            {filters.tags?.length ? (
                                                `${filters.tags.length} ${pluralize(
                                                    filters.tags.length,
                                                    {
                                                        singular: "tag",
                                                        plural: "tags",
                                                    },
                                                )} selected`
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Select
                                                </span>
                                            )}
                                            <ChevronsUpDown className="size-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="min-w-[var(--radix-popover-trigger-width)] max-w-60 p-0">
                                        <Command>
                                            <CommandInput placeholder="Search tag..." />

                                            <CommandList>
                                                <CommandEmpty className="px-4 text-xs text-muted-foreground">
                                                    No tag found with current
                                                    search query.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {tags.map((tag) => (
                                                        <CommandItem
                                                            key={tag}
                                                            value={tag}
                                                            onSelect={(
                                                                currentValue,
                                                            ) => {
                                                                setFilters(
                                                                    (
                                                                        filters,
                                                                    ) => ({
                                                                        ...filters,
                                                                        tags: filters.tags?.includes(
                                                                            currentValue,
                                                                        )
                                                                            ? filters.tags.filter(
                                                                                  (
                                                                                      tag,
                                                                                  ) =>
                                                                                      tag !==
                                                                                      currentValue,
                                                                              )
                                                                            : [
                                                                                  ...(filters.tags ||
                                                                                      []),
                                                                                  currentValue,
                                                                              ],
                                                                    }),
                                                                );
                                                            }}>
                                                            {tag}
                                                            <Check
                                                                className={cn(
                                                                    "ml-auto size-4 text-brand-orange",
                                                                    filters.tags?.includes(
                                                                        tag,
                                                                    )
                                                                        ? "opacity-100"
                                                                        : "opacity-0",
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </FormControl.Input>
                        </FormControl.Root>
                    </div>
                </div>
            </Page.Header>

            <Page.Content>
                <Separator />

                <div className="flex flex-col gap-6">
                    {filteredRules.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                            No rules found with your search query.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {filteredRules.map((r) => (
                                <KodyRuleLibraryItem
                                    key={r.uuid}
                                    rule={r}
                                    selectedRepositories={
                                        configValue?.repositories
                                    }
                                    onAddRule={(r) => {
                                        revalidateServerSideTag(
                                            "kody-rules-list",
                                        );

                                        toast({
                                            title: "Rule added to your selected repositories",
                                            description: (
                                                <ul>
                                                    {r.map((r) => (
                                                        <li key={r.uuid}>
                                                            {r.repositoryId ===
                                                            "global"
                                                                ? "Global"
                                                                : configValue?.repositories?.find(
                                                                      (cr) =>
                                                                          cr.id ===
                                                                          r.repositoryId,
                                                                  )?.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ),
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Page.Content>
        </Page.Root>
    );
};
