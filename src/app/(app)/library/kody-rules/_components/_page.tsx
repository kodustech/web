"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@components/ui/badge";
import { 
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
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
import { getLibraryKodyRulesWithFeedback } from "@services/kodyRules/fetch";
import type {
    FindLibraryKodyRulesFilters,
    KodyRuleBucket,
    LibraryRule,
    PaginatedResponse,
} from "@services/kodyRules/types";
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { ProgrammingLanguage } from "src/core/enums/programming-language";
import { cn } from "src/core/utils/components";
import { pluralize } from "src/core/utils/string";

const DEFAULT_FILTERS: FindLibraryKodyRulesFilters = {
    name: "",
    tags: [],
    // buckets is handled separately, not part of filters
};

export const KodyRulesLibrary = ({
    rules: initialRules,
    buckets,
    pagination: initialPagination,
    initialSelectedBucket,
}: {
    rules: LibraryRule[];
    buckets: KodyRuleBucket[];
    initialSelectedBucket?: string;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}) => {
    const router = useRouter();
    const [rules, setRules] = useState<LibraryRule[]>(initialRules);
    const [pagination, setPagination] = useState(initialPagination);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] =
        useState<FindLibraryKodyRulesFilters>(DEFAULT_FILTERS);
    const [selectedBucket, setSelectedBucket] = useState<string | null>(
        initialSelectedBucket || null,
    );
    
    // Ref for infinite scroll sentinel
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Load bucket rules if initial bucket is provided
    useEffect(() => {
        if (initialSelectedBucket) {
            const loadInitialBucketRules = async () => {
                setIsLoading(true);
                try {
                    const response = await getLibraryKodyRulesWithFeedback({
                        page: 1,
                        limit: 50,
                        ...filters, // Include current filters
                        buckets: [initialSelectedBucket], // Override buckets after filters
                    });

                    if (response?.data) {
                        setRules(response.data);
                        setPagination({
                            page: response.pagination?.currentPage || 1,
                            limit: response.pagination?.itemsPerPage || 50,
                            total: response.pagination?.totalItems || 0,
                            totalPages: response.pagination?.totalPages || 1,
                        });
                    }
                } catch (error) {
                    console.error("Error loading initial bucket rules:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadInitialBucketRules();
        }
    }, [initialSelectedBucket]);

    // Apply filters when they change
    useEffect(() => {
        const applyFilters = async () => {
            // Check if filters have meaningful values (not just default empty values)
            const hasActiveFilters = Object.values(filters).some(value => 
                value !== undefined && 
                value !== "" && 
                (!Array.isArray(value) || value.length > 0)
            );
            
            // Only apply filters if there are actual filter values
            // Don't override initial server-side data if filters are empty
            if (hasActiveFilters) {
                setIsLoading(true);
                try {
                    const response = await getLibraryKodyRulesWithFeedback({
                        page: 1,
                        limit: 50,
                        ...filters,
                        buckets: selectedBucket ? [selectedBucket] : undefined, // Override buckets after filters
                    });

                    if (response?.data) {
                        setRules(response.data);
                        setPagination({
                            page: response.pagination?.currentPage || 1,
                            limit: response.pagination?.itemsPerPage || 50,
                            total: response.pagination?.totalItems || 0,
                            totalPages: response.pagination?.totalPages || 1,
                        });
                    }
                } catch (error) {
                    console.error("Error applying filters:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        applyFilters();
    }, [filters, selectedBucket]);

    const filteredRules = useMemo(() => {
        let results = rules;

        // Apply client-side filters (bucket filtering is now done server-side)
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
    }, [filters, rules]);

    const tags = useMemo(() => {
        const tags = new Set<string>();
        rules?.forEach((r) => r?.tags?.forEach((t) => tags.add(t)));
        return Array.from(tags);
    }, [rules]);

    // Get bucket stats
    // Buckets already include rulesCount from API
    const bucketStats = buckets;

    const loadMoreRules = useCallback(async () => {
        if (isLoading || pagination.page >= pagination.totalPages) return;

        setIsLoading(true);
        try {
            const nextPage = pagination.page + 1;
            const response = await getLibraryKodyRulesWithFeedback({
                page: nextPage,
                limit: pagination.limit,
                ...filters, // Include all current filters
                buckets: selectedBucket ? [selectedBucket] : undefined, // Override buckets after filters
            });

            if (response?.data) {
                setRules((prev) => [...prev, ...response.data]);
                setPagination((prev) => ({
                    ...prev,
                    page: response.pagination?.currentPage || prev.page,
                }));
            }
        } catch (error) {
            console.error("Error loading more rules:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, pagination.page, pagination.totalPages, pagination.limit, selectedBucket, filters]);

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && !isLoading && pagination.page < pagination.totalPages) {
                    loadMoreRules();
                }
            },
            {
                rootMargin: '100px', // Trigger 100px before reaching the element
            }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [loadMoreRules, isLoading, pagination.page, pagination.totalPages]);

    const loadAllRules = async () => {
        setIsLoading(true);
        try {
            // Load all rules without bucket filter
            const response = await getLibraryKodyRulesWithFeedback({
                page: 1,
                limit: 50,
                ...filters, // Include current filters when loading all rules
            });

            if (response?.data) {
                setRules(response.data);
                setPagination({
                    page: response.pagination?.currentPage || 1,
                    limit: response.pagination?.itemsPerPage || 50,
                    total: response.pagination?.totalItems || 0,
                    totalPages: response.pagination?.totalPages || 1,
                });
            }
        } catch (error) {
            console.error("Error loading all rules:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadBucketRules = async (bucketSlug: string) => {
        setIsLoading(true);
        try {
            // Use backend filtering by bucket
            const response = await getLibraryKodyRulesWithFeedback({
                page: 1,
                limit: 50,
                ...filters, // Include current filters when loading bucket rules
                buckets: [bucketSlug], // Override buckets after filters
            });

            if (response?.data) {
                setRules(response.data);
                setPagination({
                    page: response.pagination?.currentPage || 1,
                    limit: response.pagination?.itemsPerPage || 50,
                    total: response.pagination?.totalItems || 0,
                    totalPages: response.pagination?.totalPages || 1,
                });
            }
        } catch (error) {
            console.error("Error loading bucket rules:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Bucket Card Component
    const BucketCard = ({
        bucket,
        isSelected,
        onClick,
    }: {
        bucket: KodyRuleBucket;
        isSelected: boolean;
        onClick: () => void;
    }) => (
        <div
            className={cn(
                "flex min-h-[140px] cursor-pointer flex-col rounded-lg border border-[#30304b] bg-[#181825] p-6 transition-colors hover:border-[#f8b76d]",
                isSelected && "border-[#f8b76d]",
            )}
            onClick={onClick}>
            <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-[#202032] p-3">
                    <div className="h-6 w-6 text-[#f8b76d]">⚖️</div>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">
                        {bucket.title}
                    </h3>
                    <p className="text-xs text-[#cdcddf]">
                        {bucket.rulesCount} rules available
                    </p>
                </div>
            </div>
            <p className="mb-4 flex-1 text-xs leading-relaxed text-[#cdcddf]">
                {bucket.description}
            </p>
            <div className="mt-auto text-xs font-bold text-[#f8b76d]">
                Explore pack →
            </div>
        </div>
    );

    return (
        <Page.Root className="over pb-0">
            <Page.Header>
                <div className="flex flex-col justify-between gap-1 w-full">
                    <Breadcrumb className="mb-1">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Rules Library</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center justify-between">
                        <Page.Title className="text-2xl font-semibold">
                            Discovery Rules
                        </Page.Title>
                        <div className="text-text-secondary text-sm text-right">
                            {selectedBucket
                                ? `Showing ${filteredRules.length} of ${pagination.total} rules`
                                : `Showing ${filteredRules.length} rules${pagination.total > 0 ? ` of ${pagination.total}` : ""}`}
                        </div>
                    </div>
                    <p className="text-text-secondary text-sm">
                        Import automated rules and guidelines for your code
                        reviews.
                    </p>
                </div>
            </Page.Header>

            {/* Explore our packs section */}
            <Page.Header>
                <div className="flex w-full flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <Heading variant="h3" className="font-bold">
                            Explore our packs
                        </Heading>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {bucketStats.slice(0, 3).map((bucket) => (
                            <BucketCard
                                key={bucket.slug}
                                bucket={bucket}
                                isSelected={selectedBucket === bucket.slug}
                                onClick={() => {
                                    const newBucket =
                                        selectedBucket === bucket.slug
                                            ? null
                                            : bucket.slug;
                                    setSelectedBucket(newBucket);
                                    
                                    // Update URL
                                    if (newBucket) {
                                        router.push(`/library/kody-rules?bucket=${newBucket}`);
                                        loadBucketRules(newBucket);
                                    } else {
                                        router.push('/library/kody-rules');
                                        // Load all rules when deselecting bucket
                                        loadAllRules();
                                    }
                                }}
                            />
                        ))}
                        <Link
                            href="/library/kody-rules/packs"
                            noHoverUnderline
                            className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-[#30304b] bg-[#101019] p-6 transition-colors hover:border-[#f8b76d]">
                            <span className="text-center text-sm font-bold text-[#79799f]">
                                Explore all packs →
                            </span>
                        </Link>
                    </div>
                </div>
            </Page.Header>

            {/* Explore all rules section */}
            <Page.Header>
                <div className="mt-6 flex w-full flex-col gap-6">
                    <div className="flex flex-row items-center justify-between gap-4">
                        <Heading variant="h3" className="font-bold">
                            {selectedBucket
                                ? `${buckets.find((b) => b.slug === selectedBucket)?.title || "Selected"} Rules`
                                : "Explore all rules"}
                        </Heading>
                        <Link
                            href=""
                            className="text-sm font-medium text-[#f8b76d]"
                            onClick={(e) => {
                                e.preventDefault();
                                setFilters(DEFAULT_FILTERS);
                                setSelectedBucket(null);
                                router.push('/library/kody-rules');
                                loadAllRules();
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
                    </div>
                </div>
            </Page.Header>

            <Page.Content className="px-6">
                <Separator />

                <div className="flex flex-col gap-6">
                    {filteredRules.length === 0 ? (
                        <div className="text-text-secondary flex flex-col items-center gap-2 text-sm">
                            No rules found with your search query.
                        </div>
                    ) : (
                        <>
                            {/* Selected bucket indicator */}
                            {selectedBucket && (
                                <div className="mb-4 flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="border-[#f8b76d]/20 bg-[#f8b76d]/10 text-[#f8b76d]">
                                        {
                                            buckets.find(
                                                (b) =>
                                                    b.slug === selectedBucket,
                                            )?.title
                                        }
                                    </Badge>
                                    <span className="text-sm text-[#cdcddf]">
                                        {filteredRules.length} of{" "}
                                        {pagination.total} rules in this
                                        category
                                    </span>
                                </div>
                            )}

                            {/* Simple grid of rules */}
                            <div className="grid grid-cols-2 gap-4">
                                {filteredRules.map((rule) => (
                                    <KodyRuleLibraryItem
                                        key={rule.uuid}
                                        rule={rule}
                                        showLikeButton
                                    />
                                ))}
                            </div>

                            {/* Infinite Scroll Sentinel */}
                            {pagination.page < pagination.totalPages && (
                                <div 
                                    ref={loadMoreRef}
                                    className="mt-8 flex justify-center items-center py-4"
                                >
                                    {isLoading && (
                                        <div className="flex items-center gap-2 text-[#cdcddf]">
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#f8b76d]"></div>
                                            <span className="text-sm">Loading more rules...</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* End indicator */}
                            {pagination.page >= pagination.totalPages && rules.length > 0 && (
                                <div className="mt-8 flex justify-center">
                                    <span className="text-[#79799f] text-sm">
                                        All {pagination.total} rules loaded
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Page.Content>
        </Page.Root>
    );
};
