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
    Critical: "bg-danger/10 text-danger border-danger/64",
    High: "bg-warning/10 text-warning border-warning/64",
    Medium: "bg-alert/10 text-alert border-alert/64",
    Low: "bg-info/10 text-info border-info/64",
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
                            className={cn(
                                "h-fit rounded-lg border-1 px-2 text-[10px] leading-px uppercase",
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

                            <Section.Content className="text-text-secondary text-sm">
                                {rule.why_is_this_important}
                            </Section.Content>
                        </Section.Root>

                        <Section.Root>
                            <Section.Header>
                                <Section.Title>Instructions</Section.Title>
                            </Section.Header>

                            <Section.Content className="text-text-secondary text-sm">
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

                <DialogFooter className="justify-between gap-8">
                    <div className="flex flex-wrap items-center justify-start gap-1">
                        {rule.tags.map((tag) => (
                            <Badge key={tag} className="h-2 px-2.5 font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-end gap-px">
                        {repositoryId && (
                            <Button
                                size="md"
                                variant="primary"
                                leftIcon={<Plus />}
                                onClick={addToRepositories}
                                loading={isAddingToRepositories}>
                                Add to my rules
                            </Button>
                        )}

                        {!repositoryId && (
                            <>
                                <Button
                                    size="md"
                                    variant="primary"
                                    leftIcon={<Plus />}
                                    className="rounded-r-none"
                                    onClick={addToRepositories}
                                    loading={isAddingToRepositories}
                                    disabled={
                                        selectedRepositoriesIds.length === 0
                                    }>
                                    Add to my rules
                                </Button>

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
                <Button
                    size="md"
                    variant="primary"
                    className="group rounded-l-none px-3">
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
                        <CommandEmpty className="text-text-secondary px-4 text-xs">
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
                                                "text-primary-light ml-auto size-4",
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
                    "children:size-4 flex size-6 items-center justify-center rounded-full",
                    !example.isCorrect ? "bg-danger/10" : "bg-success/10",
                )}>
                {!example.isCorrect ? (
                    <XIcon className="stroke-danger" />
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
        <Section.Content className="text-text-secondary text-sm">
            <SyntaxHighlight language={language}>
                {example.snippet}
            </SyntaxHighlight>
        </Section.Content>
    </Section.Root>
);
