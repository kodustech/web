import { Button } from "@components/ui/button";
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
import { magicModal } from "@components/ui/magic-modal";
import { Separator } from "@components/ui/separator";
import { SliderWithMarkers } from "@components/ui/slider-with-markers";
import { Textarea } from "@components/ui/textarea";
import { ToggleGroup } from "@components/ui/toggle-group";
import { Checkbox } from "@components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { createOrUpdateKodyRule } from "@services/kodyRules/fetch";
import {
    KodyRulesOrigin,
    KodyRulesStatus,
    type KodyRule,
} from "@services/kodyRules/types";
import { CheckIcon, HelpCircle, XIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { cn } from "src/core/utils/components";

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

export const KodyRuleAddOrUpdateItemModal = ({
    repositoryId,
    rule,
    onClose,
}: {
    rule?: KodyRule;
    repositoryId: string;
    onClose?: () => void;
}) => {
    const form = useForm<
        Omit<KodyRule, "examples"> & {
            badExample: string;
            goodExample: string;
        }
    >({
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        defaultValues: {
            path: rule?.path ?? "",
            rule: rule?.rule ?? "",
            title: rule?.title ?? "",
            severity: rule?.severity ?? "high",
            scope: rule?.scope ?? "file",
            badExample:
                rule?.examples?.find(({ isCorrect }) => !isCorrect)?.snippet ??
                "",
            goodExample:
                rule?.examples?.find(({ isCorrect }) => isCorrect)?.snippet ??
                "",
            origin: rule?.origin ?? KodyRulesOrigin.USER,
            status: rule?.status ?? KodyRulesStatus.ACTIVE,
        },
    });

    const formState = form.formState;
    const watchScope = form.watch("scope");

    const handleSubmit = form.handleSubmit(async (config) => {
        if (onClose) {
            // Se for usado via callback (novo padrão), não usar magicModal
            let examples = [];
            if (config.badExample)
                examples.push({ isCorrect: false, snippet: config.badExample });
            if (config.goodExample)
                examples.push({ isCorrect: true, snippet: config.goodExample });

            await createOrUpdateKodyRule(
                {
                    path: config.scope === "file" ? config.path : "", // Se for pull-request, path fica vazio
                    rule: config.rule,
                    title: config.title,
                    severity: config.severity,
                    scope: config.scope,
                    uuid: rule?.uuid,
                    examples: examples,
                    origin: config.origin ?? KodyRulesOrigin.USER,
                    status: config.status ?? KodyRulesStatus.ACTIVE,
                },
                repositoryId,
            );

            onClose();
        } else {
            // Padrão antigo com magicModal
            magicModal.lock();

            let examples = [];
            if (config.badExample)
                examples.push({ isCorrect: false, snippet: config.badExample });
            if (config.goodExample)
                examples.push({ isCorrect: true, snippet: config.goodExample });

            await createOrUpdateKodyRule(
                {
                    path: config.scope === "file" ? config.path : "", // Se for pull-request, path fica vazio
                    rule: config.rule,
                    title: config.title,
                    severity: config.severity,
                    scope: config.scope,
                    uuid: rule?.uuid,
                    examples: examples,
                    origin: config.origin ?? KodyRulesOrigin.USER,
                    status: config.status ?? KodyRulesStatus.ACTIVE,
                },
                repositoryId,
            );

            magicModal.hide(true);
        }
    });

    return (
        <Dialog open onOpenChange={() => onClose ? onClose() : magicModal.hide()}>
            <DialogContent className="max-w-(--breakpoint-md)">
                <DialogHeader>
                    <DialogTitle>
                        {rule ? "Edit rule" : "Add new rule"}
                    </DialogTitle>
                </DialogHeader>

                <div className="-mx-6 flex flex-col gap-8 overflow-y-auto px-6 py-1">
                    <Controller
                        name="title"
                        rules={{ required: "Rule name is required" }}
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div className="grid grid-cols-[1fr_2fr] items-center gap-6">
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
                                            className="opacity-100!"
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                            maxLength={300}
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
                            <div className="grid grid-cols-[1fr_2fr] gap-6">
                                <FormControl.Root>
                                    <FormControl.Label className="mb-0">
                                        Scope
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        Define how this rule should be applied
                                    </FormControl.Helper>
                                </FormControl.Root>

                                <FormControl.Input>
                                    <ToggleGroup.Root
                                        type="single"
                                        className="grid grid-cols-2 gap-3"
                                        value={field.value}
                                        onValueChange={(value) => {
                                            if (!value) return;
                                            field.onChange(value);
                                            // Se mudou para pull-request, limpa o path
                                            if (value === "pull-request") {
                                                form.setValue("path", "");
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
                                                    className="h-auto w-full items-start py-3">
                                                    <div className="flex w-full items-center justify-between gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <Heading
                                                                variant="h3"
                                                                className="text-sm font-medium">
                                                                {option.name}
                                                            </Heading>
                                                        </div>

                                                        <Checkbox
                                                            decorative
                                                            checked={
                                                                option.value === field.value
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
                        name="path"
                        control={form.control}
                        render={({ field }) => (
                            <div className="grid grid-cols-[1fr_2fr] gap-6">
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
                                    <div>
                                        <Input
                                            id={field.name}
                                            value={field.value}
                                            className="opacity-100!"
                                            placeholder="Example: **/*.js"
                                            disabled={watchScope === "pull-request"}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                            maxLength={600}
                                        />

                                        <FormControl.Helper>
                                            {watchScope === "pull-request"
                                                ? "Path is not applicable for pull request scope"
                                                : "If empty, rule will be applied to all files."
                                            }
                                        </FormControl.Helper>
                                    </div>
                                </FormControl.Input>
                            </div>
                        )}
                    />

                    <Controller
                        control={form.control}
                        rules={{
                            required: "Instructions are required",
                        }}
                        name="rule"
                        render={({ field, fieldState }) => (
                            <div className="grid grid-cols-[1fr_2fr] gap-6">
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
                                            error={fieldState.error}
                                            value={field.value}
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
                                <div className="grid grid-cols-[1fr_2fr] gap-6">
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
                                            <SliderWithMarkers
                                                id={field.name}
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
                                <div className="grid grid-cols-[1fr_2fr] gap-6">
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
                                <div className="grid grid-cols-[1fr_2fr] gap-6">
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

                <DialogFooter>
                    <Button
                        variant="cancel"
                        size="md"
                        onClick={() => onClose ? onClose() : magicModal.hide()}>
                        Cancel
                    </Button>

                    <Button
                        size="md"
                        variant="primary"
                        formTarget="add-or-update-rule-form"
                        loading={formState.isSubmitting}
                        onClick={handleSubmit}
                        disabled={!formState.isValid || !formState.isDirty}>
                        {rule ? "Update rule" : "Create rule"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
