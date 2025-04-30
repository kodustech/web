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
import { RuleLike } from "@services/ruleLike/types";
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
    rulesWithLikes,
    configValue,
}: {
    rules: LibraryRule[];
    rulesWithLikes: RuleLike[];
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

    console.log(rulesWithLikes);

    const formatedRules = useMemo(() => {
        return rules.map((r) => ({
            ...r,
            likesCount:
                rulesWithLikes.find((rl) => rl.ruleId === r.uuid)?.likeCount ??
                0,
            isLiked:
                rulesWithLikes.find((rl) => rl.ruleId === r.uuid)?.userLiked ??
                false,
        }));
    }, [rules, rulesWithLikes]);

    const filteredRules = useMemo(() => {
        let results = formatedRules;

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
                        size="sm"
                        variant="helper"
                        className="mb-10 text-xs"
                        leftIcon={<ArrowLeft />}
                        onClick={router.back}>
                        Go back to Kody Rules
                    </Button>

                    <Page.Title className="text-2xl font-semibold">
                        Discovery Rules
                    </Page.Title>
                    <p className="text-text-secondary text-sm">
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
                            }}>
                            Clear all
                        </Link>
                    </div>

                    <div className="flex flex-row items-end gap-4">
                        <FormControl.Root className="flex-2">
                            <FormControl.Label htmlFor="name">
                                Name
                            </FormControl.Label>

                            <FormControl.Input>
                                <Input
                                    id="name"
                                    value={filters.name}
                                    leftIcon={<SearchIcon />}
                                    placeholder="Search rules by name"
                                    onChange={(e) =>
                                        setFilters((filters) => ({
                                            ...filters,
                                            name: e.target.value,
                                        }))
                                    }
                                />
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
                                            size="lg"
                                            variant="helper"
                                            role="combobox"
                                            id="severity"
                                            className="w-full justify-between"
                                            rightIcon={
                                                <ChevronsUpDown className="-mr-2 opacity-50" />
                                            }>
                                            {filters.severity ? (
                                                filters.severity
                                            ) : (
                                                <span>Select</span>
                                            )}
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
                                                                    "text-primary-light -mr-2 ml-auto size-4",
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
                                            size="lg"
                                            id="language"
                                            variant="helper"
                                            role="combobox"
                                            className="w-full justify-between"
                                            rightIcon={
                                                <ChevronsUpDown className="-mr-2 opacity-50" />
                                            }>
                                            {filters.language ? (
                                                ProgrammingLanguage[
                                                    filters.language
                                                ]
                                            ) : (
                                                <span>Select</span>
                                            )}
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
                                                                    "text-primary-light -mr-2 ml-auto size-4",
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
                                            id="tags"
                                            size="lg"
                                            variant="helper"
                                            role="combobox"
                                            className="w-full justify-between"
                                            rightIcon={
                                                <ChevronsUpDown className="-mr-2 opacity-50" />
                                            }>
                                            {filters.tags?.length ? (
                                                `${filters.tags.length} ${pluralize(
                                                    filters.tags.length,
                                                    {
                                                        singular: "tag",
                                                        plural: "tags",
                                                    },
                                                )} selected`
                                            ) : (
                                                <span>Select</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        className="max-w-60 min-w-[var(--radix-popover-trigger-width)] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search tag..." />

                                            <CommandList>
                                                <CommandEmpty className="text-text-secondary px-4 text-xs">
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
                                                                    "text-primary-light -mr-2 ml-auto size-4",
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
                        <div className="text-text-secondary flex flex-col items-center gap-2 text-sm">
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
                                            variant: "success",
                                            title: "Rule added to your selected repositories",
                                            description: (
                                                <ul className="list-disc pl-4">
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
