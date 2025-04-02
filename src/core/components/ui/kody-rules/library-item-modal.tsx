"use client";

import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal } from "@components/ui/magic-modal";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { Section } from "@components/ui/section";
import { Separator } from "@components/ui/separator";
import { SyntaxHighlight } from "@components/ui/syntax-highlight";
import { useAsyncAction } from "@hooks/use-async-action";
import { addKodyRuleToRepositories } from "@services/kodyRules/fetch";
import {
    KodyRulesOrigin,
    KodyRulesStatus,
    type KodyRule,
    type LibraryRule,
} from "@services/kodyRules/types";
import { Check, CheckIcon, ChevronDown, Plus, XIcon } from "lucide-react";
import type { LiteralUnion } from "react-hook-form";
import type { ProgrammingLanguage } from "src/core/enums/programming-language";
import { cn } from "src/core/utils/components";

const severityVariantMap = {
    Critical: "!bg-destructive/5 border-destructive/10 text-destructive",
    High: "!bg-brand-purple/5 border-brand-purple/10 text-brand-purple",
    Medium: "!bg-brand-orange/5 border-brand-orange/10 text-brand-orange",
    Low: "!bg-success/5 border-success/10 text-success",
} as const satisfies Record<string, string>;

export const KodyRuleLibraryItemModal = ({
    rule,
    repositoryId,
    teamId,
    onAddRule,
    selectedRepositories,
}: {
    teamId: string;
    rule: LibraryRule;
    repositoryId?: LiteralUnion<"global", string>;
    onAddRule?: (rules: KodyRule[]) => void;
    selectedRepositories?: Array<{
        id: string;
        name: string;
        isSelected?: boolean;
    }>;
}) => {
    const [selectedRepositoriesIds, setSelectedRepositoriesIds] = useState<
        string[]
    >(repositoryId ? [repositoryId] : []);

    const [addToRepositories, { loading: isAddingToRepositories }] =
        useAsyncAction(async () => {
            const newRule = {
                title: rule.title,
                rule: rule.rule,
                severity: rule.severity.toLowerCase() as KodyRule["severity"],
                path: "",
                examples: rule.examples,
                origin: KodyRulesOrigin.LIBRARY,
                status: KodyRulesStatus.ACTIVE,
            };

            const a = await addKodyRuleToRepositories(
                selectedRepositoriesIds,
                newRule,
            );

            onAddRule?.(a);
            magicModal.hide();
        });

    const badExample = rule.examples?.find(({ isCorrect }) => !isCorrect);
    const goodExample = rule.examples?.find(({ isCorrect }) => isCorrect);

    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader className="gap-3">
                    <DialogTitle className="flex items-center gap-2">
                        {rule.title}

                        <Badge
                            disabled
                            variant="outline"
                            className={cn(
                                "h-6 !cursor-default px-2.5 text-[10px] uppercase !opacity-100",
                                severityVariantMap[
                                    rule.severity as typeof rule.severity
                                ],
                            )}>
                            {rule.severity}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="-mx-6 overflow-auto px-6">
                    <div className="flex flex-col gap-6">
                        <Section.Root>
                            <Section.Header>
                                <Section.Title>
                                    Why is it important?
                                </Section.Title>
                            </Section.Header>

                            <Section.Content className="text-sm text-muted-foreground">
                                {rule.why_is_this_important}
                            </Section.Content>
                        </Section.Root>

                        <Section.Root>
                            <Section.Header>
                                <Section.Title>Instructions</Section.Title>
                            </Section.Header>

                            <Section.Content className="text-sm text-muted-foreground">
                                {rule.rule}
                            </Section.Content>
                        </Section.Root>

                        <Separator />

                        {badExample && (
                            <ExampleSection
                                language={rule.language}
                                example={badExample}
                            />
                        )}

                        {goodExample && (
                            <ExampleSection
                                language={rule.language}
                                example={goodExample}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter className="justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-start gap-1">
                        {rule.tags.map((tag) => (
                            <Badge
                                key={tag}
                                disabled
                                variant="outline"
                                className="!cursor-default text-xs !opacity-100">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex flex-row items-center justify-end">
                        {repositoryId && (
                            <Button
                                size="sm"
                                leftIcon={<Plus />}
                                onClick={addToRepositories}
                                loading={isAddingToRepositories}>
                                Add to my rules
                            </Button>
                        )}

                        {!repositoryId && (
                            <>
                                <Button
                                    size="sm"
                                    leftIcon={<Plus />}
                                    className="rounded-r-none"
                                    onClick={addToRepositories}
                                    loading={isAddingToRepositories}
                                    disabled={
                                        selectedRepositoriesIds.length === 0
                                    }>
                                    Add to my rules
                                </Button>

                                <Separator orientation="vertical" />

                                <SelectRepositoriesDropdown
                                    selectedRepositories={
                                        selectedRepositories ?? []
                                    }
                                    teamId={teamId}
                                    selectedRepositoriesIds={
                                        selectedRepositoriesIds
                                    }
                                    setSelectedRepositoriesIds={
                                        setSelectedRepositoriesIds
                                    }
                                />
                            </>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SelectRepositoriesDropdown = ({
    teamId,
    selectedRepositoriesIds,
    setSelectedRepositoriesIds,
    selectedRepositories,
}: {
    teamId: string;
    selectedRepositoriesIds: Array<string>;
    setSelectedRepositoriesIds: (
        selectedRepositoriesIds: Array<string>,
    ) => void;
    selectedRepositories: Array<{
        id: string;
        name: string;
        isSelected?: boolean;
    }>;
}) => {
    const repositories = [{ id: "global", name: "Global" }].concat(
        selectedRepositories,
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm" className="group rounded-l-none pl-2.5">
                    <ChevronDown
                        className={cn(
                            "size-4",
                            "transition-transform group-data-[state=closed]:rotate-180",
                        )}
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                side="top"
                sideOffset={10}
                className="w-72 p-0">
                <Command
                    filter={(value, search) => {
                        const repository = repositories.find(
                            (r) => r.id === value,
                        );

                        if (!repository) return 0;

                        if (
                            repository.name
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        ) {
                            return 1;
                        }

                        return 0;
                    }}>
                    <CommandInput placeholder="Search repositories..." />

                    <CommandList>
                        <CommandEmpty className="px-4 text-xs text-muted-foreground">
                            No repositories found with current search query.
                        </CommandEmpty>
                        <CommandGroup>
                            {repositories
                                .filter(
                                    (repository: {
                                        id: string;
                                        name: string;
                                        isSelected?: boolean;
                                    }) =>
                                        repository?.isSelected ||
                                        repository.id === "global",
                                )
                                .map((r) => (
                                    <CommandItem
                                        key={r.id}
                                        value={r.id}
                                        onSelect={() => {
                                            setSelectedRepositoriesIds(
                                                selectedRepositoriesIds.includes(
                                                    r.id,
                                                )
                                                    ? selectedRepositoriesIds.filter(
                                                          (id) => id !== r.id,
                                                      )
                                                    : [
                                                          ...selectedRepositoriesIds,
                                                          r.id,
                                                      ],
                                            );
                                        }}>
                                        {r.name}
                                        <Check
                                            className={cn(
                                                "ml-auto size-4 text-brand-orange",
                                                selectedRepositoriesIds.includes(
                                                    r.id,
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
    );
};

const ExampleSection = ({
    example,
    language,
}: {
    example: {
        isCorrect: boolean;
        snippet: string;
    };
    language: keyof typeof ProgrammingLanguage;
}) => (
    <Section.Root>
        <Section.Header className="gap-4">
            <div
                className={cn(
                    "flex size-6 items-center justify-center rounded-full children:size-4",
                    !example.isCorrect ? "bg-destructive/10" : "bg-success/10",
                )}>
                {!example.isCorrect ? (
                    <XIcon className="stroke-destructive" />
                ) : (
                    <CheckIcon className="stroke-success" />
                )}
            </div>
            <div className="flex flex-1 flex-col gap-3">
                <div className="text-sm font-medium">
                    {!example.isCorrect ? "Bad" : "Good"}
                </div>
            </div>
        </Section.Header>
        <Section.Content className="text-sm text-muted-foreground">
            <SyntaxHighlight language={language}>
                {example.snippet}
            </SyntaxHighlight>
        </Section.Content>
    </Section.Root>
);
