import React, { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { magicModal } from "@components/ui/magic-modal";
import { Separator } from "@components/ui/separator";
import { SliderWithMarkers } from "@components/ui/slider-with-markers";
import { Switch } from "@components/ui/switch";
import { useToast } from "@components/ui/toaster/use-toast";
import { ToggleGroup } from "@components/ui/toggle-group";
import { RichTextEditorWithMentions, type RichTextEditorWithMentionsRef, type MentionGroup, type MentionGroupItem } from "@components/ui/rich-text-editor-with-mentions";
import { CodeInputSimple } from "@components/ui/code-input-simple";
import { useMCPMentions } from "src/core/hooks/use-mcp-mentions";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { createOrUpdateKodyRule } from "@services/kodyRules/fetch";
import {
    KodyRuleInheritanceOrigin,
    KodyRulesOrigin,
    KodyRulesStatus,
    KodyRuleWithInheritanceDetails,
    type KodyRule,
} from "@services/kodyRules/types";
import {
    AtSign,
    CheckIcon,
    ChevronDown,
    Code2,
    FileCode,
    GitPullRequest,
    HelpCircle,
    Info,
    PlusIcon,
    SaveIcon,
    Settings2,
    XIcon,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { cn } from "src/core/utils/components";
import { ExternalReferencesDisplay } from "../[repositoryId]/pr-summary/_components/external-references-display";

import type {
    FormattedDirectoryCodeReviewConfig,
} from "../_types";

const severityLevelFilterOptions = {
    low: { label: "Low", value: 0 },
    medium: { label: "Medium", value: 1 },
    high: { label: "High", value: 2 },
    critical: { label: "Critical", value: 3 },
} satisfies Record<KodyRule["severity"], { label: string; value: number }>;

const executionModeOptions = [
    {
        value: "file",
        name: "Per file",
        description: "Runs once for each changed file",
        icon: FileCode,
    },
    {
        value: "pull-request",
        name: "Per PR",
        description: "Runs once for the whole PR",
        icon: GitPullRequest,
    },
] as const;

const PR_CONTEXT_VARIABLES = [
    { key: "pr_title", label: "pr_title" },
    { key: "pr_description", label: "pr_description" },
    { key: "pr_total_additions", label: "pr_total_additions" },
    { key: "pr_total_deletions", label: "pr_total_deletions" },
    { key: "pr_total_files", label: "pr_total_files" },
    { key: "pr_total_lines_changed", label: "pr_total_lines_changed" },
    { key: "pr_files_diff", label: "pr_files_diff" },
    { key: "pr_tags", label: "pr_tags" },
    { key: "pr_author", label: "pr_author" },
    { key: "pr_number", label: "pr_number" },
] as const;

const FILE_CONTEXT_VARIABLES = [
    { key: "fileDiff", label: "fileDiff" },
] as const;

const INSTRUCTIONS_PLACEHOLDER = `Write the instructions for this rule.

Use variables to access context:
- Per PR: pr_title, pr_description, pr_files_diff...
- Per file: fileDiff
`;

const BAD_EXAMPLE_PLACEHOLDER = `for (var i = 1; i != 10; i += 2)  // Noncompliant. Infinite; i goes from 9 straight to 11.
{
  //...
}`;

const GOOD_EXAMPLE_PLACEHOLDER = `for (var i = 1; i <= 10; i += 2)  // Compliant
{
  //...
}`;

const getDirectoryPathForReplace = (
    directory: FormattedDirectoryCodeReviewConfig,
) => `${directory.path.slice(1)}/`;
const getKodyRulePathWithoutDirectoryPath = ({
    directory,
    rule,
}: {
    rule: KodyRule;
    directory: FormattedDirectoryCodeReviewConfig;
}) => rule.path.replace(getDirectoryPathForReplace(directory), "");

const DEFAULT_PATH_FOR_DIRECTORIES = "**";

function MCPToolsPopover({
    mcpGroups,
    disabled,
    onInsertMention,
}: {
    mcpGroups: MentionGroup[];
    disabled?: boolean;
    onInsertMention: (app: string, tool: string) => void;
}) {
    const [selectedApp, setSelectedApp] = React.useState<MentionGroupItem | null>(null);
    const [tools, setTools] = React.useState<MentionGroup[] | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);

    const apps = mcpGroups[0]?.items ?? [];

    const handleSelectApp = async (app: MentionGroupItem) => {
        if (app.children) {
            const childGroups = await app.children();
            setTools(childGroups);
            setSelectedApp(app);
        }
    };

    const handleBack = () => {
        setSelectedApp(null);
        setTools(null);
    };

    const handleInsertTool = (tool: MentionGroupItem) => {
        const rawApp = String(tool.meta?.appName ?? "");
        const app = rawApp
            .toLowerCase()
            .replace(/\bmcp\b/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
        const toolName = String(tool.label).toLowerCase();

        onInsertMention(app, toolName);
        setIsOpen(false);
        setSelectedApp(null);
        setTools(null);
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setSelectedApp(null);
                setTools(null);
            }
        }}>
            <PopoverTrigger asChild>
                <Button
                    size="xs"
                    variant="cancel"
                    type="button"
                    disabled={disabled}
                    className="h-7 gap-1"
                    rightIcon={<ChevronDown className="size-3" />}
                    leftIcon={<AtSign className="size-3" />}>
                    MCP
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-72 p-0 max-h-80 overflow-hidden">
                <div className="p-3 border-b border-card-lv3 flex items-center gap-2">
                    {selectedApp && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                            ← Back
                        </button>
                    )}
                    <span className="text-xs font-medium text-text-primary">
                        {selectedApp ? selectedApp.label : "Select MCP"}
                    </span>
                </div>
                <div className="overflow-y-auto max-h-64 p-2">
                    {!selectedApp ? (
                        <div className="flex flex-col gap-1">
                            {apps.map((app) => (
                                <button
                                    key={app.value}
                                    type="button"
                                    className="flex items-center justify-between w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-card-lv3 transition-colors"
                                    onClick={() => handleSelectApp(app)}>
                                    <span>{app.label}</span>
                                    <ChevronDown className="size-4 -rotate-90 text-text-secondary" />
                                </button>
                            ))}
                            {apps.length === 0 && (
                                <p className="text-xs text-text-secondary text-center py-4">
                                    No MCP connections available
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {tools?.flatMap((group) =>
                                group.items.map((tool) => (
                                    <button
                                        key={tool.value}
                                        type="button"
                                        className="text-xs font-mono bg-tertiary-dark text-tertiary-light px-2 py-1 rounded hover:brightness-125 transition-all"
                                        onClick={() => handleInsertTool(tool)}>
                                        {tool.label}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export const KodyRuleAddOrUpdateItemModal = ({
    repositoryId,
    directory,
    rule,
    onClose,
    canEdit,
}: {
    rule?: KodyRuleWithInheritanceDetails;
    directory?: FormattedDirectoryCodeReviewConfig;
    repositoryId: string;
    onClose?: () => void;
    canEdit: boolean;
}) => {
    const { toast } = useToast();

    const initialScope = rule?.scope ?? "file";

    const isInherited = !!rule?.inherited;

    const isExcluded = !!rule?.inheritance?.exclude?.find(
        (id) => id === directory?.id || id === repositoryId,
    );

    const [isInheritanceDisabled, setIsInheritanceDisabled] =
        useState(isExcluded);

    const { mcpGroups, formatInsertByType } = useMCPMentions();

    const editorRef = React.useRef<RichTextEditorWithMentionsRef>(null);

    const form = useForm<
        Omit<KodyRule, "examples" | "inheritance"> & {
            badExample: string;
            goodExample: string;
            inheritable: boolean;
        }
    >({
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        disabled: !canEdit || isInherited,
        defaultValues: {
            path:
                initialScope === "pull-request"
                    ? ""
                    : rule
                        ? !directory
                            ? rule.path
                            : (() => {
                                const pathWithoutDirectory =
                                    getKodyRulePathWithoutDirectoryPath({
                                        directory,
                                        rule,
                                    });
                                return (
                                    pathWithoutDirectory ||
                                    DEFAULT_PATH_FOR_DIRECTORIES
                                );
                            })()
                        : directory
                            ? DEFAULT_PATH_FOR_DIRECTORIES
                            : "",
            rule: rule?.rule ?? "",
            title: rule?.title ?? "",
            severity: rule?.severity ?? "high",
            scope: initialScope,
            badExample:
                rule?.examples?.find(({ isCorrect }) => !isCorrect)?.snippet ??
                "",
            goodExample:
                rule?.examples?.find(({ isCorrect }) => isCorrect)?.snippet ??
                "",
            origin: rule?.origin ?? KodyRulesOrigin.USER,
            status: rule?.status ?? KodyRulesStatus.ACTIVE,
            inheritable: rule?.inheritance?.inheritable ?? true,
        },
    });

    const formState = form.formState;
    const watchScope = form.watch("scope");

    const handleSubmit = form.handleSubmit(async (config) => {
        if (!onClose) {
            magicModal.lock();
        }

        let examples = [];
        if (config.badExample)
            examples.push({ isCorrect: false, snippet: config.badExample });
        if (config.goodExample)
            examples.push({ isCorrect: true, snippet: config.goodExample });

        let newPath = "";
        if (config.scope === "file") {
            if (directory) {
                newPath = `${getDirectoryPathForReplace(directory)}${config.path}`;
            } else {
                newPath = config.path;
            }
        }

        await createOrUpdateKodyRule(
            {
                path: newPath,
                rule: config.rule,
                title: config.title,
                severity: config.severity,
                scope: config.scope,
                uuid: rule?.uuid,
                examples: examples,
                origin: config.origin ?? KodyRulesOrigin.USER,
                status: config.status ?? KodyRulesStatus.ACTIVE,
                inheritance: {
                    ...(rule?.inheritance ?? {
                        inheritable: true,
                        exclude: [],
                        include: [],
                    }),
                    inheritable: config.inheritable,
                },
            },
            repositoryId,
            directory?.id,
        );

        toast({
            description: `Rule ${rule?.uuid ? "updated" : "created"}`,
            variant: "success",
        });

        if (!onClose) {
            magicModal.hide(true);
        } else {
            onClose();
        }
    });

    const handleDisableInherited = async (val: boolean) => {
        magicModal.lock();

        const targetId = directory?.id || repositoryId;

        const excludeList = rule?.inheritance?.exclude
            ? [...rule.inheritance.exclude]
            : [];

        if (!val) {
            const index = excludeList.indexOf(targetId);
            if (index !== -1) excludeList.splice(index, 1);
        } else {
            if (!excludeList.includes(targetId)) excludeList.push(targetId);
        }

        try {
            await createOrUpdateKodyRule(
                {
                    path: rule?.path,
                    rule: rule?.rule,
                    title: rule?.title,
                    severity: rule?.severity,
                    scope: rule?.scope,
                    uuid: rule?.uuid,
                    examples: rule?.examples,
                    origin: rule?.origin ?? KodyRulesOrigin.USER,
                    status: rule?.status ?? KodyRulesStatus.ACTIVE,
                    inheritance: {
                        ...(rule?.inheritance ?? {
                            inheritable: true,
                            exclude: [],
                            include: [],
                        }),
                        exclude: excludeList,
                    },
                } as KodyRule,
                rule?.repositoryId,
                rule?.directoryId,
            );

            setIsInheritanceDisabled(val);

            const toastData = {
                title: val ? "Disabled inheritance" : "Enabled inheritance",
                description: val
                    ? "This rule is no longer being inherited for this scope."
                    : "This rule is now being inherited from higher scopes.",
                variant: "success" as const,
            };

            toast(toastData);
        } catch {
            toast({
                variant: "alert",
                description:
                    "An error occurred while disabling inheritance. Please try again.",
                title: "Error disabling inheritance",
            });
        } finally {
            magicModal.unlock();
        }
    };

    let title = "Add new rule";
    if (isInherited) {
        title = "View inherited rule";
    } else if (!canEdit) {
        title = "View rule";
    } else if (rule) {
        title = "Edit rule";
    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    if (onClose) {
                        onClose();
                    } else {
                        magicModal.hide();
                    }
                }
            }}>
            <DialogContent className="max-w-(--breakpoint-lg)">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                {isInherited && (
                    <div className="bg-card-lv1 mb-4 flex flex-col gap-4 rounded-lg border p-4 px-6">
                        <div className="flex items-center gap-2">
                            <Info className="text-text-secondary size-5" />
                            <Heading variant="h3" className="text-base">
                                Inherited Rule
                            </Heading>
                        </div>
                        <p className="text-text-secondary text-sm">
                            {rule.inherited ===
                                KodyRuleInheritanceOrigin.GLOBAL &&
                                "This rule is inherited from the Global configuration. To edit it, you must go to the global Kody Rules settings."}
                            {rule.inherited ===
                                KodyRuleInheritanceOrigin.REPOSITORY &&
                                "This rule is inherited from the Repository configuration. To edit it, you must go to the repository Kody Rules settings."}
                            {rule.inherited ===
                                KodyRuleInheritanceOrigin.DIRECTORY &&
                                "This rule is inherited from another Directory configuration. This is likely due to how the rule's path is defined. To edit it, you must go to the Kody Rules settings for the directory where it was created."}
                        </p>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="disable-inheritance"
                                className="text-sm font-medium">
                                Override and disable for this scope
                            </Label>
                            <Switch
                                id="disable-inheritance"
                                disabled={!canEdit}
                                onCheckedChange={handleDisableInherited}
                                checked={isInheritanceDisabled}
                            />
                        </div>
                    </div>
                )}

                <div className="-mx-6 flex flex-col gap-8 overflow-y-auto px-6 py-1">
                    <Controller
                        name="title"
                        rules={{ required: "Rule name is required" }}
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div className="grid grid-cols-[1fr_3fr] items-center gap-6">
                                <FormControl.Root>
                                    <FormControl.Label
                                        className="mb-0 flex flex-row gap-1"
                                        htmlFor={field.name}>
                                        Rule name
                                    </FormControl.Label>
                                </FormControl.Root>

                                <FormControl.Input>
                                    <div>
                                        <Input
                                            id={field.name}
                                            error={fieldState.error}
                                            placeholder="Avoid using 'console.log' statements in production code."
                                            maxLength={300}
                                            value={field.value}
                                            disabled={field.disabled}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                        />

                                        <FormControl.Error>
                                            {fieldState.error?.message}
                                        </FormControl.Error>
                                    </div>
                                </FormControl.Input>
                            </div>
                        )}
                    />

                    <Controller
                        name="scope"
                        control={form.control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-[1fr_3fr] gap-6">
                                    <FormControl.Root>
                                        <FormControl.Label className="mb-0 flex flex-row gap-1">
                                            Execution mode
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle
                                                        size={16}
                                                        className="text-primary-light"
                                                    />
                                                </TooltipTrigger>

                                                <TooltipContent
                                                    align="start"
                                                    className="flex max-w-prose flex-col gap-1 text-xs">
                                                    <p>
                                                        <strong className="text-primary-light">
                                                            Per file:
                                                        </strong>{" "}
                                                        Rule executes once for each
                                                        changed file. Use this for
                                                        file-specific validations.
                                                    </p>
                                                    <p>
                                                        <strong className="text-primary-light">
                                                            Per PR:
                                                        </strong>{" "}
                                                        Rule executes once for the
                                                        entire pull request. Use this
                                                        for cross-file analysis.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormControl.Label>
                                        <FormControl.Helper>
                                            How many times this rule runs
                                        </FormControl.Helper>
                                    </FormControl.Root>

                                    <FormControl.Input>
                                        <ToggleGroup.Root
                                            type="single"
                                            className="flex w-full gap-3"
                                            value={field.value}
                                            disabled={field.disabled}
                                            onValueChange={(value) => {
                                                if (value) field.onChange(value);

                                                if (value === "file") {
                                                    let newPath = "";

                                                    if (directory) {
                                                        if (rule) {
                                                            newPath =
                                                                getKodyRulePathWithoutDirectoryPath(
                                                                    {
                                                                        directory,
                                                                        rule,
                                                                    },
                                                                );
                                                        } else {
                                                            newPath =
                                                                DEFAULT_PATH_FOR_DIRECTORIES;
                                                        }
                                                    }

                                                    form.setValue("path", newPath, {
                                                        shouldValidate: true,
                                                    });
                                                } else if (
                                                    value === "pull-request"
                                                ) {
                                                    form.resetField("path", {
                                                        defaultValue: "",
                                                    });
                                                }
                                            }}>
                                            {executionModeOptions.map((option) => {
                                                const Icon = option.icon;
                                                const isSelected = option.value === field.value;
                                                return (
                                                    <ToggleGroup.ToggleGroupItem
                                                        asChild
                                                        key={option.value}
                                                        value={option.value}>
                                                        <Button
                                                            size="md"
                                                            variant="helper"
                                                            className={cn(
                                                                "h-auto flex-1 items-start py-4 px-4",
                                                                isSelected && "ring-2 ring-primary-light"
                                                            )}>
                                                            <div className="flex w-full items-start justify-between gap-3">
                                                                <div className="flex items-start gap-3">
                                                                    <div className={cn(
                                                                        "flex size-9 items-center justify-center rounded-lg",
                                                                        isSelected ? "bg-primary-light/20" : "bg-card-lv3"
                                                                    )}>
                                                                        <Icon className={cn(
                                                                            "size-5",
                                                                            isSelected ? "text-primary-light" : "text-text-secondary"
                                                                        )} />
                                                                    </div>
                                                                    <div className="flex flex-col gap-0.5 text-left">
                                                                        <span className="text-sm font-medium">
                                                                            {option.name}
                                                                        </span>
                                                                        <span className="text-xs text-text-secondary">
                                                                            {option.description}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <Checkbox
                                                                    decorative
                                                                    checked={isSelected}
                                                                />
                                                            </div>
                                                        </Button>
                                                    </ToggleGroup.ToggleGroupItem>
                                                );
                                            })}
                                        </ToggleGroup.Root>
                                    </FormControl.Input>
                                </div>
                            </div>
                        )}
                    />

                    <Controller
                        name="path"
                        control={form.control}
                        rules={{
                            required:
                                directory && watchScope === "file"
                                    ? "Path is required"
                                    : undefined,
                        }}
                        render={({ field, fieldState }) => (
                            <div className="grid grid-cols-[1fr_3fr] gap-6">
                                <FormControl.Root>
                                    <FormControl.Label
                                        className="mb-0 flex flex-row gap-1"
                                        htmlFor={field.name}>
                                        Path
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle
                                                    size={16}
                                                    className="text-primary-light"
                                                />
                                            </TooltipTrigger>

                                            <TooltipContent
                                                align="start"
                                                className="flex max-w-prose flex-col gap-1 text-xs">
                                                <p>
                                                    Define which files this rule
                                                    applies to using glob
                                                    patterns.
                                                </p>
                                                <p>
                                                    The{" "}
                                                    <code className="text-primary-light">
                                                        *
                                                    </code>{" "}
                                                    symbol matches any sequence
                                                    of characters, includes
                                                    subdirectories, and{" "}
                                                    <code className="text-primary-light">
                                                        ?
                                                    </code>{" "}
                                                    matches a single character.
                                                </p>
                                                <p>
                                                    For example,{" "}
                                                    <code className="text-primary-light">
                                                        /*.js
                                                    </code>{" "}
                                                    applies the rule to all .js
                                                    files in any folder or
                                                    subfolder.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        File path glob pattern.
                                    </FormControl.Helper>
                                </FormControl.Root>

                                <FormControl.Input>
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            {directory &&
                                                watchScope === "file" &&
                                                !isInherited && (
                                                    <Badge
                                                        size="md"
                                                        variant="helper"
                                                        className="text-text-primary pointer-events-none h-full rounded-r-none ring-1">
                                                        {directory?.path}/
                                                    </Badge>
                                                )}

                                            <Input
                                                id={field.name}
                                                value={field.value}
                                                maxLength={600}
                                                placeholder="Example: **/*.js"
                                                error={fieldState.error}
                                                className={cn(
                                                    directory &&
                                                    !isInherited &&
                                                    watchScope === "file" &&
                                                    "rounded-l-none",
                                                )}
                                                disabled={
                                                    field.disabled ||
                                                    watchScope ===
                                                    "pull-request"
                                                }
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <FormControl.Error>
                                            {fieldState.error?.message}
                                        </FormControl.Error>

                                        {watchScope === "pull-request" ? (
                                            <FormControl.Helper className="text-warning">
                                                Path is not applicable for pull
                                                request scope
                                            </FormControl.Helper>
                                        ) : directory ? null : (
                                            <FormControl.Helper>
                                                If empty, rule will be applied
                                                to all files.
                                            </FormControl.Helper>
                                        )}
                                    </div>
                                </FormControl.Input>
                            </div>
                        )}
                    />

                    {rule?.sourcePath && (
                        <div className="grid grid-cols-[1fr_3fr] gap-6">
                            <FormControl.Root>
                                <FormControl.Label className="mb-0 flex flex-row gap-1">
                                    Source
                                </FormControl.Label>

                                <FormControl.Helper>
                                    Readonly. This Kody Rule was created based
                                    on this file.
                                </FormControl.Helper>
                            </FormControl.Root>

                            <FormControl.Input>
                                <Input value={rule?.sourcePath} disabled />
                            </FormControl.Input>
                        </div>
                    )}

                    <Controller
                        name="rule"
                        control={form.control}
                        rules={{ required: "Instructions are required" }}
                        render={({ field, fieldState }) => (
                            <div className="grid grid-cols-[1fr_3fr] gap-6">
                                <FormControl.Root>
                                    <FormControl.Label
                                        className="mb-0 flex flex-row gap-1"
                                        htmlFor={field.name}>
                                        Instructions
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle
                                                    size={16}
                                                    className="text-primary-light"
                                                />
                                            </TooltipTrigger>

                                            <TooltipContent
                                                align="start"
                                                className="flex max-w-prose flex-col gap-1 text-xs">
                                                <p>
                                                    Describe what Kody should
                                                    focus on during the review.
                                                </p>
                                                <p>
                                                    Use variables like{" "}
                                                    <code className="text-primary-light">
                                                        {"{{pr.body}}"}
                                                    </code>{" "}
                                                    or{" "}
                                                    <code className="text-primary-light">
                                                        {"{{file.path}}"}
                                                    </code>{" "}
                                                    to reference dynamic context.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        Provide guidelines for code review
                                    </FormControl.Helper>
                                </FormControl.Root>

                                <FormControl.Input>
                                    <div className="flex flex-col gap-2">
                                        <RichTextEditorWithMentions
                                            ref={editorRef}
                                            value={field.value || ""}
                                            onChangeAction={(value) =>
                                                field.onChange(
                                                    typeof value === "string"
                                                        ? value
                                                        : "",
                                                )
                                            }
                                            disabled={field.disabled}
                                            placeholder={INSTRUCTIONS_PLACEHOLDER}
                                            saveFormat="text"
                                            groups={mcpGroups}
                                            formatInsertByType={formatInsertByType}
                                            className="min-h-32"
                                            toolbarExtraActions={
                                                <>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                size="xs"
                                                                variant="cancel"
                                                                type="button"
                                                                disabled={field.disabled}
                                                                className="h-7 gap-1"
                                                                rightIcon={<ChevronDown className="size-3" />}
                                                                leftIcon={<Code2 className="size-3" />}>
                                                                Variables
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            align="end"
                                                            className="w-72 p-3">
                                                            <div className="flex flex-col gap-3">
                                                                <span className="text-xs font-medium text-text-primary">
                                                                    {watchScope === "file"
                                                                        ? "File context"
                                                                        : "PR context"}
                                                                </span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {(watchScope === "file"
                                                                        ? FILE_CONTEXT_VARIABLES
                                                                        : PR_CONTEXT_VARIABLES
                                                                    ).map((v) => (
                                                                        <button
                                                                            key={v.key}
                                                                            type="button"
                                                                            className="text-xs font-mono bg-primary-dark text-primary-light px-2 py-1 rounded hover:brightness-125 transition-all"
                                                                            onClick={() => {
                                                                                editorRef.current?.insertText(v.label);
                                                                                editorRef.current?.focus();
                                                                            }}>
                                                                            {v.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>

                                                    {mcpGroups.length > 0 && (
                                                        <MCPToolsPopover
                                                            mcpGroups={mcpGroups}
                                                            disabled={field.disabled}
                                                            onInsertMention={(app, tool) => {
                                                                editorRef.current?.insertMCPMention(app, tool);
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            }
                                        />

                                        <FormControl.Error>
                                            {fieldState.error?.message}
                                        </FormControl.Error>

                                        <ExternalReferencesDisplay
                                            externalReferences={{
                                                references: rule?.externalReferences || [],
                                                syncErrors: rule?.syncErrors || (rule?.syncError ? [rule.syncError] : []),
                                                processingStatus: rule?.referenceProcessingStatus || "completed"
                                            }}
                                            compact
                                        />
                                    </div>
                                </FormControl.Input>
                            </div>
                        )}
                    />

                    <Controller
                        name="severity"
                        control={form.control}
                        render={({ field, fieldState }) => {
                            const labels = Object.values(
                                severityLevelFilterOptions,
                            ).map((option) => option.label);
                            const severityLevel =
                                severityLevelFilterOptions[field.value];
                            const numberValue = severityLevel?.value;

                            return (
                                <div className="grid grid-cols-[1fr_3fr] gap-6">
                                    <FormControl.Root>
                                        <FormControl.Label
                                            className="flex flex-row gap-1"
                                            htmlFor={field.name}>
                                            Severity
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle
                                                        size={16}
                                                        className="text-primary-light"
                                                    />
                                                </TooltipTrigger>

                                                <TooltipContent
                                                    align="start"
                                                    className="flex max-w-prose flex-col gap-1 text-xs">
                                                    <p>
                                                        Severity determines how
                                                        likely this rule is to
                                                        reach the user. Higher
                                                        severity increases the
                                                        chances of surfacing
                                                        this rule in reviews.
                                                    </p>

                                                    <ul className="flex flex-col gap-1">
                                                        <li>
                                                            <strong className="text-primary-light">
                                                                Low:
                                                            </strong>{" "}
                                                            Minimal impact, less
                                                            likely to appear.
                                                        </li>
                                                        <li>
                                                            <strong className="text-primary-light">
                                                                Medium:
                                                            </strong>{" "}
                                                            Moderate importance,
                                                            balanced visibility.
                                                        </li>
                                                        <li>
                                                            <strong className="text-primary-light">
                                                                High:
                                                            </strong>{" "}
                                                            High priority, more
                                                            likely to surface.
                                                        </li>
                                                        <li>
                                                            <strong className="text-primary-light">
                                                                Critical:
                                                            </strong>{" "}
                                                            Maximum priority,
                                                            most likely to be
                                                            shown.
                                                        </li>
                                                    </ul>

                                                    <p>
                                                        If no severity is
                                                        selected,{" "}
                                                        <strong className="text-primary-light">
                                                            High
                                                        </strong>{" "}
                                                        will be used by default.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </FormControl.Label>
                                        <FormControl.Helper>
                                            Select the minimum severity level
                                        </FormControl.Helper>
                                    </FormControl.Root>

                                    <FormControl.Input>
                                        <div className="relative">
                                            <div className="w-96">
                                                <SliderWithMarkers
                                                    id={field.name}
                                                    disabled={field.disabled}
                                                    min={0}
                                                    max={3}
                                                    step={1}
                                                    labels={labels}
                                                    value={numberValue}
                                                    onValueChange={(value) =>
                                                        field.onChange(
                                                            Object.entries(
                                                                severityLevelFilterOptions,
                                                            ).find(
                                                                ([, v]) =>
                                                                    v.value ===
                                                                    value,
                                                            )?.[0],
                                                        )
                                                    }
                                                    className={cn([
                                                        {
                                                            "[--slider-marker-background-active:#119DE4]":
                                                                field.value ===
                                                                "low",
                                                            "[--slider-marker-background-active:#115EE4]":
                                                                field.value ===
                                                                "medium",
                                                            "[--slider-marker-background-active:#6A57A4]":
                                                                field.value ===
                                                                "high",
                                                            "[--slider-marker-background-active:#EF4B4B]":
                                                                field.value ===
                                                                "critical",
                                                        },
                                                    ])}
                                                />
                                            </div>

                                            <FormControl.Error>
                                                {fieldState.error?.message}
                                            </FormControl.Error>
                                        </div>
                                    </FormControl.Input>
                                </div>
                            );
                        }}
                    />

                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                                <Settings2 className="size-4" />
                                <span>Advanced settings</span>
                                <CollapsibleIndicator className="ml-auto" />
                            </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="flex flex-col gap-6 pt-4">
                            <Controller
                                name="inheritable"
                                control={form.control}
                                render={({ field }) => (
                                    <div className="grid grid-cols-[1fr_3fr] gap-6">
                                        <FormControl.Root>
                                            <FormControl.Label className="mb-0 flex flex-row gap-1">
                                                Inheritable
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <HelpCircle
                                                            size={16}
                                                            className="text-primary-light"
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        align="start"
                                                        className="flex max-w-prose flex-col gap-1 text-xs">
                                                        <p>
                                                            When enabled, this rule can
                                                            be inherited by lower
                                                            scopes.
                                                        </p>
                                                        <p>
                                                            If disabled, the rule will
                                                            only apply to the current
                                                            scope.
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </FormControl.Label>
                                            <FormControl.Helper>
                                                Allow lower scopes to inherit
                                            </FormControl.Helper>
                                        </FormControl.Root>
                                        <FormControl.Input>
                                            <Switch
                                                id={field.name}
                                                disabled={field.disabled}
                                                onCheckedChange={field.onChange}
                                                checked={field.value}
                                            />
                                        </FormControl.Input>
                                    </div>
                                )}
                            />

                            <Separator />

                            <div className="flex flex-col gap-4">
                                <span className="text-sm font-medium text-text-secondary">
                                    Code examples
                                </span>

                                <Controller
                                    control={form.control}
                                    name="badExample"
                                    render={({ field, fieldState }) => (
                                        <div className="grid grid-cols-[1fr_3fr] gap-6">
                                            <FormControl.Root>
                                                <FormControl.Label
                                                    className="mb-0 flex flex-row gap-1"
                                                    htmlFor={field.name}>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "bg-danger/10 flex size-6 items-center justify-center rounded-full",
                                                            )}>
                                                            <XIcon className="stroke-danger size-4" />
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            Bad example
                                                        </span>
                                                    </div>
                                                </FormControl.Label>
                                            </FormControl.Root>

                                            <FormControl.Input>
                                                <div>
                                                    <CodeInputSimple
                                                        value={field.value || ""}
                                                        onChangeAction={(value) =>
                                                            field.onChange(value)
                                                        }
                                                        disabled={field.disabled}
                                                        language="javascript"
                                                    />

                                                    <FormControl.Error>
                                                        {fieldState.error?.message}
                                                    </FormControl.Error>
                                                </div>
                                            </FormControl.Input>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="goodExample"
                                    render={({ field, fieldState }) => (
                                        <div className="grid grid-cols-[1fr_3fr] gap-6">
                                            <FormControl.Root>
                                                <FormControl.Label
                                                    className="mb-0 flex flex-row gap-1"
                                                    htmlFor={field.name}>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "bg-success/10 flex size-6 items-center justify-center rounded-full",
                                                            )}>
                                                            <CheckIcon className="stroke-success size-4" />
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            Good example
                                                        </span>
                                                    </div>
                                                </FormControl.Label>
                                            </FormControl.Root>

                                            <FormControl.Input>
                                                <div>
                                                    <CodeInputSimple
                                                        value={field.value || ""}
                                                        onChangeAction={(value) =>
                                                            field.onChange(value)
                                                        }
                                                        disabled={field.disabled}
                                                        language="javascript"
                                                    />

                                                    <FormControl.Error>
                                                        {fieldState.error?.message}
                                                    </FormControl.Error>
                                                </div>
                                            </FormControl.Input>
                                        </div>
                                    )}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                <DialogFooter className="mt-0">
                    <Button
                        variant="cancel"
                        size="md"
                        onClick={() => {
                            if (onClose) {
                                onClose();
                            } else {
                                magicModal.hide();
                            }
                        }}>
                        Cancel
                    </Button>

                    <Button
                        size="md"
                        variant="primary"
                        loading={formState.isSubmitting}
                        onClick={handleSubmit}
                        leftIcon={rule ? <SaveIcon /> : <PlusIcon />}
                        disabled={
                            formState.disabled ||
                            !formState.isValid ||
                            !formState.isDirty
                        }>
                        {rule ? "Update rule" : "Create rule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
