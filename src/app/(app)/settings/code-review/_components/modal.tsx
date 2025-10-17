import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
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
import { Textarea } from "@components/ui/textarea";
import { useToast } from "@components/ui/toaster/use-toast";
import { ToggleGroup } from "@components/ui/toggle-group";
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
    CheckIcon,
    HelpCircle,
    Info,
    InfoIcon,
    PlusIcon,
    SaveIcon,
    XIcon,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { cn } from "src/core/utils/components";

import type {
    CodeReviewDirectoryConfig,
    FormattedCodeReviewBaseConfig,
    FormattedCodeReviewConfig,
    FormattedDirectoryCodeReviewConfig,
} from "../_types";

const severityLevelFilterOptions = {
    low: { label: "Low", value: 0 },
    medium: { label: "Medium", value: 1 },
    high: { label: "High", value: 2 },
    critical: { label: "Critical", value: 3 },
} satisfies Record<KodyRule["severity"], { label: string; value: number }>;

const scopeOptions = [
    {
        value: "file",
        name: "File",
    },
    {
        value: "pull-request",
        name: "Pull Request",
    },
] as const;

const INSTRUCTIONS_PLACEHOLDER = `Write the instructions for this rule. Example:
- Focus on security changes and performance impacts.
- Summarize concisely, highlighting modified public APIs.
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
        if (!onClose) magicModal.lock();

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

    console.log(rule);

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
            onOpenChange={() => (onClose ? onClose() : magicModal.hide())}>
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
                            <div className="grid grid-cols-[1fr_3fr] gap-6">
                                <FormControl.Root>
                                    <FormControl.Label className="mb-0 flex flex-row gap-1">
                                        Scope
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
                                                        File:
                                                    </strong>{" "}
                                                    When the rule should be
                                                    applied to one file at a
                                                    time.
                                                </p>
                                                <p>
                                                    <strong className="text-primary-light">
                                                        Pull Request:
                                                    </strong>{" "}
                                                    When the rule should be
                                                    applied cross-file,
                                                    considering all files in the
                                                    PR at once.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        Define how this rule should be applied
                                    </FormControl.Helper>
                                </FormControl.Root>

                                <FormControl.Input>
                                    <ToggleGroup.Root
                                        type="single"
                                        className="flex w-md gap-3"
                                        value={field.value}
                                        disabled={field.disabled}
                                        onValueChange={(value) => {
                                            if (value) field.onChange(value);

                                            if (value === "file") {
                                                let newPath = "";

                                                if (directory) {
                                                    if (rule) {
                                                        // Editing an existing rule: remove the directory prefix from the path
                                                        newPath =
                                                            getKodyRulePathWithoutDirectoryPath(
                                                                {
                                                                    directory,
                                                                    rule,
                                                                },
                                                            );
                                                    } else {
                                                        // Adding a new rule: default to wildcard
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
                                        {scopeOptions.map((option) => (
                                            <ToggleGroup.ToggleGroupItem
                                                asChild
                                                key={option.value}
                                                value={option.value}>
                                                <Button
                                                    size="md"
                                                    variant="helper"
                                                    className="h-auto flex-1 items-start py-3">
                                                    <div className="flex w-full items-center justify-between gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <Heading
                                                                variant="h3"
                                                                className="text-sm leading-loose font-medium">
                                                                {option.name}
                                                            </Heading>
                                                        </div>

                                                        <Checkbox
                                                            decorative
                                                            checked={
                                                                option.value ===
                                                                field.value
                                                            }
                                                        />
                                                    </div>
                                                </Button>
                                            </ToggleGroup.ToggleGroupItem>
                                        ))}
                                    </ToggleGroup.Root>
                                </FormControl.Input>
                            </div>
                        )}
                    />

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
                                                    scopes. For example, a
                                                    global rule can be inherited
                                                    by repositories, and a
                                                    repository rule can be
                                                    inherited by directories.
                                                </p>
                                                <p>
                                                    If disabled, the rule will
                                                    only apply to the current
                                                    scope.
                                                </p>
                                                <p>
                                                    Note: Lower scopes can still
                                                    choose to override and
                                                    disable this rule if needed.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        Define if this rule can be inherited by
                                        lower scopes
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
                                                    For example, you could
                                                    highlight security and
                                                    performance changes or call
                                                    out updates to public APIs.
                                                </p>
                                                <p>
                                                    Keep it clear and concise to
                                                    ensure accurate reviews.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        Provide additional guidelines for code
                                        review based on file paths.
                                    </FormControl.Helper>
                                </FormControl.Root>

                                <FormControl.Input>
                                    <div>
                                        <Textarea
                                            id={field.name}
                                            value={field.value}
                                            disabled={field.disabled}
                                            placeholder={
                                                INSTRUCTIONS_PLACEHOLDER
                                            }
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                            className="flex min-h-32 opacity-100!"
                                        />

                                        <FormControl.Error>
                                            {fieldState.error?.message}
                                        </FormControl.Error>

                                        {rule?.syncError && (
                                            <div className="text-text-secondary mt-2 flex w-full items-center gap-2 rounded-lg bg-red-500/10 p-2 text-sm">
                                                <InfoIcon className="size-4 flex-shrink-0" />
                                                <span className="text-text-secondary text-xs">
                                                    {rule.syncError}
                                                </span>
                                            </div>
                                        )}
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

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <Heading variant="h3">Examples</Heading>

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
                                                <div className="flex flex-1 flex-col gap-3">
                                                    <div className="text-sm font-medium">
                                                        Bad example
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl.Label>
                                    </FormControl.Root>

                                    <FormControl.Input>
                                        <div>
                                            <Textarea
                                                error={fieldState.error}
                                                value={field.value}
                                                disabled={field.disabled}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex min-h-32 opacity-100!"
                                                placeholder={
                                                    BAD_EXAMPLE_PLACEHOLDER
                                                }
                                                id={field.name}
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
                                                <div className="flex flex-1 flex-col gap-3">
                                                    <div className="text-sm font-medium">
                                                        Good example
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl.Label>
                                    </FormControl.Root>

                                    <FormControl.Input>
                                        <div>
                                            <Textarea
                                                error={fieldState.error}
                                                value={field.value}
                                                disabled={field.disabled}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex min-h-32 opacity-100!"
                                                placeholder={
                                                    GOOD_EXAMPLE_PLACEHOLDER
                                                }
                                                id={field.name}
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
                </div>

                <DialogFooter className="mt-0">
                    <Button
                        variant="cancel"
                        size="md"
                        onClick={() =>
                            onClose ? onClose() : magicModal.hide()
                        }>
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
