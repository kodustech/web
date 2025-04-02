"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Button, buttonVariants } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Input } from "@components/ui/input";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Section } from "@components/ui/section";
import { SliderWithMarkers } from "@components/ui/slider-with-markers";
import { toast } from "@components/ui/toaster/use-toast";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { PARAMETERS_PATHS } from "@services/parameters";
import { createOrUpdateCodeReviewParameter } from "@services/parameters/fetch";
import {
    KodyLearningStatus,
    ParametersConfigKey,
} from "@services/parameters/types";
import { Info, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";

import CodeGroupingExampleCard from "../CodeGroupingExampleCard";
import { useAutomationCodeReviewConfig, usePlatformConfig } from "../context";
import GeneratingConfig from "./generating-config";
import {
    GroupingModeSuggestions,
    LimitationType,
    SeverityLevel,
    type AutomationCodeReviewConfigPageProps,
    type CodeReviewGlobalConfig,
} from "./types";

const MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE = 20;

const limitationTypeOptions = [
    {
        value: LimitationType.FILE,
        name: "By file",
    },
    {
        default: true,
        value: LimitationType.PR,
        name: "By pull request",
    },
] satisfies Array<{ value: string; name: string; default?: boolean }>;

const GroupingModeOptions = [
    {
        value: GroupingModeSuggestions.FULL,
        name: "Unified Comments",
        default: true,
    },
    {
        value: GroupingModeSuggestions.MINIMAL,
        name: "Individual Comments",
    },
] satisfies Array<{ value: string; name: string; default?: boolean }>;
const severityLevelFilterOptions = {
    low: { label: "Low/All", value: 0 },
    medium: { label: "Medium", value: 1 },
    high: { label: "High", value: 2 },
    critical: { label: "Critical", value: 3 },
} satisfies Record<SeverityLevel, { label: string; value: number }>;

export const SuggestionControl = (
    props: AutomationCodeReviewConfigPageProps,
) => {
    const { teamId } = useSelectedTeamId();

    const config = useAutomationCodeReviewConfig(props.repositoryId);
    const platformConfig = usePlatformConfig();

    const form = useForm<CodeReviewGlobalConfig & { id?: string }>({
        defaultValues: {
            ...config,
            suggestionControl: config?.suggestionControl ?? {
                groupingMode: GroupingModeSuggestions.FULL,
                limitationType: LimitationType.PR,
                maxSuggestions: 9,
                severityLevelFilter: SeverityLevel.MEDIUM,
            },
        },
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
    });

    const MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE =
        Object.values(config?.reviewOptions ?? {}).filter((option) => option)
            .length * 1;

    const limitationType = form.watch("suggestionControl.limitationType");
    const MIN_SUGGESTIONS =
        limitationType === LimitationType.PR
            ? MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE
            : 0;
    const MAX_SUGGESTIONS =
        limitationType === LimitationType.FILE
            ? MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE
            : undefined;

    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const handleSubmit = form.handleSubmit(async (config) => {
        try {
            // lidando com configs legadas
            const {
                limitationType: legacyLimitationType,
                maxSuggestions: legacyMaxSuggestions,
                severityLevelFilter: legacySeverityLevelFilter,
                suggestionControl,
                ...rest
            } = config as any;

            // Se já existir suggestionControl, usamos ele; se não, usamos os valores legados
            const normalizedSuggestionControl = suggestionControl || {
                groupingMode: GroupingModeSuggestions.FULL, // ou outro valor padrão
                limitationType: legacyLimitationType || LimitationType.PR,
                maxSuggestions: legacyMaxSuggestions || 9,
                severityLevelFilter:
                    legacySeverityLevelFilter || SeverityLevel.MEDIUM,
            };

            const finalConfig = {
                ...rest,
                suggestionControl: normalizedSuggestionControl,
            };

            await createOrUpdateCodeReviewParameter(
                finalConfig,
                teamId,
                config?.id,
            );

            await invalidateQueries({
                type: "all",
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            });

            form.reset(finalConfig);

            toast({
                title: "Success",
                description:
                    "Code review automation settings saved successfully.",
                variant: "default",
            });
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);

            toast({
                title: "Error",
                description:
                    "An error occurred while saving the settings. Please try again.",
                variant: "destructive",
            });
        }
    });

    const validateNumberInput = (value: string) => {
        const numValue = parseInt(value.replace(/^0+/, ""));
        return isNaN(numValue) ? 0 : numValue;
    };

    const {
        isDirty: formIsDirty,
        isValid: formIsValid,
        isSubmitting: formIsSubmitting,
    } = form.formState;

    if (
        platformConfig.kodyLearningStatus ===
        KodyLearningStatus.GENERATING_CONFIG
    ) {
        return <GeneratingConfig />;
    }

    return (
        <Page.Root>
            <Page.Header>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                href={`/settings/code-review/${props.repositoryId}/general`}>
                                {props.repositoryId === "global"
                                    ? "Global"
                                    : config?.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator />

                        <BreadcrumbItem>
                            <BreadcrumbPage>Suggestion control</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </Page.Header>

            <Page.Header>
                <Page.Title>Suggestion control</Page.Title>
                <hr />

                <Page.HeaderActions>
                    <Button
                        leftIcon={<Save />}
                        onClick={handleSubmit}
                        disabled={!formIsDirty || !formIsValid}
                        loading={formIsSubmitting}>
                        Save settings
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content className="mt-10 flex-none">
                <div className="flex flex-col gap-2">
                    <Heading variant="h2">Suggestion grouping mode</Heading>
                    <small className="text-sm text-muted-foreground">
                        Define how Kody consolidates multiple suggestions in a
                        single PR.
                    </small>
                </div>
                <div className="mt-3 flex flex-row">
                    <div className="flex flex-col gap-8">
                        <Controller
                            name="suggestionControl.groupingMode"
                            control={form.control}
                            render={({ field }) => (
                                <FormControl.Root className="space-y-1">
                                    <FormControl.Label htmlFor="groupingModeOptions">
                                        Choose mode:
                                    </FormControl.Label>

                                    <FormControl.Input>
                                        <ToggleGroup.Root
                                            id="groupingModeOptions"
                                            type="single"
                                            disabled={field.disabled}
                                            className="mr-[20px] flex flex-col gap-2"
                                            value={field.value}
                                            onValueChange={(value) => {
                                                if (value)
                                                    field.onChange(value);
                                            }}>
                                            {GroupingModeOptions.map(
                                                (option) => (
                                                    <ToggleGroup.ToggleGroupItem
                                                        asChild
                                                        key={option.value}
                                                        value={option.value}>
                                                        <Card
                                                            className={cn(
                                                                buttonVariants({
                                                                    variant:
                                                                        "outline",
                                                                }),
                                                                "h-auto cursor-pointer items-start px-5 py-4 disabled:cursor-not-allowed",
                                                            )}>
                                                            <div className="flex h-full w-full items-start justify-between">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Heading variant="h3">
                                                                            {
                                                                                option.name
                                                                            }
                                                                        </Heading>
                                                                        {option.default && (
                                                                            <small className="text-xm text-muted-foreground">
                                                                                (default)
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <Checkbox
                                                                    disabled
                                                                    className="pointer-events-none ml-2 children:opacity-100 disabled:opacity-100"
                                                                    checked={
                                                                        field.value ===
                                                                        option.value
                                                                    }
                                                                />
                                                            </div>
                                                        </Card>
                                                    </ToggleGroup.ToggleGroupItem>
                                                ),
                                            )}
                                        </ToggleGroup.Root>
                                    </FormControl.Input>
                                </FormControl.Root>
                            )}
                        />
                    </div>
                    <div className="w-3/5">
                        <CodeGroupingExampleCard
                            groupingType={form.getValues(
                                "suggestionControl.groupingMode",
                            )}
                        />
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <Heading variant="h2">Suggestion limit</Heading>
                        <small className="text-sm text-muted-foreground">
                            Configure the number of comments Kody can leave
                            during code reviews
                        </small>
                    </div>
                    <Controller
                        name="suggestionControl.limitationType"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root className="space-y-1">
                                <FormControl.Label htmlFor="reviewOptions">
                                    Limitation type
                                </FormControl.Label>

                                <FormControl.Input>
                                    <ToggleGroup.Root
                                        id="reviewOptions"
                                        type="single"
                                        disabled={field.disabled}
                                        className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
                                        value={field.value}
                                        onValueChange={(value) => {
                                            if (value) field.onChange(value);
                                            form.trigger(
                                                "suggestionControl.maxSuggestions",
                                            );
                                        }}>
                                        {limitationTypeOptions.map((option) => (
                                            <ToggleGroup.ToggleGroupItem
                                                asChild
                                                key={option.value}
                                                value={option.value}>
                                                <Card
                                                    className={cn(
                                                        buttonVariants({
                                                            variant: "outline",
                                                        }),
                                                        "h-auto cursor-pointer items-start px-5 py-4 disabled:cursor-not-allowed",
                                                    )}>
                                                    <div className="flex h-full w-full items-start justify-between">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-1">
                                                                <Heading variant="h3">
                                                                    {
                                                                        option.name
                                                                    }
                                                                </Heading>
                                                                {option.default && (
                                                                    <small className="text-muted-foreground">
                                                                        (default)
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Checkbox
                                                            disabled
                                                            className="pointer-events-none children:opacity-100 disabled:opacity-100"
                                                            checked={
                                                                field.value ===
                                                                option.value
                                                            }
                                                        />
                                                    </div>
                                                </Card>
                                            </ToggleGroup.ToggleGroupItem>
                                        ))}
                                    </ToggleGroup.Root>
                                </FormControl.Input>
                            </FormControl.Root>
                        )}
                    />

                    <Controller
                        name="suggestionControl.maxSuggestions"
                        control={form.control}
                        rules={{
                            validate: (value) => {
                                if (value === 0) return;

                                if (
                                    form.getValues(
                                        "suggestionControl.limitationType",
                                    ) === "file"
                                ) {
                                    if (
                                        value <=
                                        MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE
                                    )
                                        return;

                                    return `Maximum limit is ${MAX_SUGGESTIONS_FOR_FILE_LIMITATION_TYPE}`;
                                }

                                if (
                                    form.getValues(
                                        "suggestionControl.limitationType",
                                    ) === "pr"
                                ) {
                                    if (
                                        value >=
                                        MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE
                                    )
                                        return;

                                    return `The configured limit is too low. Please increase it to at least ${MIN_SUGGESTIONS_FOR_PR_LIMITATION_TYPE} based on the selected categories.`;
                                }
                            },
                        }}
                        render={({ field, fieldState }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor="max-suggestions">
                                    Maximum number of suggestions
                                </FormControl.Label>

                                <FormControl.Input>
                                    <Input
                                        id="max-suggestions"
                                        disabled={field.disabled}
                                        error={fieldState.error}
                                        type="number"
                                        value={field.value}
                                        onChange={(e) =>
                                            field.onChange(
                                                validateNumberInput(
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                        min={0}
                                        max={MAX_SUGGESTIONS}
                                        className="w-[25%]"
                                        placeholder="0"
                                    />
                                </FormControl.Input>

                                <FormControl.Error>
                                    {fieldState.error?.message}
                                </FormControl.Error>

                                <FormControl.Helper>
                                    Enter a number, or leave it as 0 for no
                                    limit{" "}
                                    {limitationType === "file"
                                        ? `(no min, max: ${MAX_SUGGESTIONS})`
                                        : `(min: ${MIN_SUGGESTIONS}, no max)`}
                                </FormControl.Helper>
                            </FormControl.Root>
                        )}
                    />

                    <div className="flex flex-col gap-3">
                        <Controller
                            name="suggestionControl.severityLevelFilter"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                const labels = Object.values(
                                    severityLevelFilterOptions,
                                ).map((option) => option.label);
                                const severityLevel =
                                    severityLevelFilterOptions[field.value];
                                const numberValue = severityLevel?.value;
                                const values = numberValue
                                    ? [numberValue]
                                    : [0];

                                return (
                                    <div className="mt-6">
                                        <Heading variant="h2">
                                            Minimum severity level
                                        </Heading>
                                        <small className="text-sm text-muted-foreground">
                                            Select the minimum severity level
                                            for Kody to post code review
                                            suggestions
                                        </small>
                                        <FormControl.Root>
                                            <FormControl.Input>
                                                <div className="relative mt-3 w-96">
                                                    <SliderWithMarkers
                                                        id={field.name}
                                                        min={0}
                                                        max={3}
                                                        step={1}
                                                        labels={labels}
                                                        value={values}
                                                        onValueChange={([
                                                            value,
                                                        ]) =>
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
                                                        className={cn({
                                                            "[--slider-marker-background-active:200,86%,48%]":
                                                                field.value ===
                                                                "low",
                                                            "[--slider-marker-background-active:218,86%,48%]":
                                                                field.value ===
                                                                "medium",
                                                            "[--slider-marker-background-active:var(--brand-purple)]":
                                                                field.value ===
                                                                "high",
                                                            "[--slider-marker-background-active:var(--brand-red)]":
                                                                field.value ===
                                                                "critical",
                                                        })}
                                                    />
                                                </div>
                                            </FormControl.Input>

                                            <FormControl.Error>
                                                {fieldState.error?.message}
                                            </FormControl.Error>

                                            <FormControl.Helper>
                                                Kody will provide suggestions
                                                with severity from{" "}
                                                <strong>
                                                    {severityLevel.label}
                                                </strong>{" "}
                                                and higher
                                            </FormControl.Helper>
                                        </FormControl.Root>
                                    </div>
                                );
                            }}
                        />

                        <div className="mt-10 flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Info />}
                                onClick={() =>
                                    magicModal.show(
                                        SeverityLevelsExplanationModal,
                                    )
                                }>
                                Learn about severity levels
                            </Button>
                        </div>
                    </div>
                </div>
            </Page.Content>
        </Page.Root>
    );
};

const SeverityLevelsExplanationModal = () => {
    return (
        <Dialog open onOpenChange={() => magicModal.hide()}>
            <DialogContent className="gap-0">
                <DialogHeader>
                    <DialogTitle>Severity levels</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 overflow-y-auto text-sm text-muted-foreground">
                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="font-bold text-foreground">
                                Low Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-sm text-muted-foreground">
                            Minor enhancements that would improve code quality.
                            These represent small optimizations, style
                            improvements, or subtle refinements that would
                            incrementally better the codebase.
                        </Section.Content>
                    </Section.Root>

                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="font-bold text-foreground">
                                Medium Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-sm text-muted-foreground">
                            Moderate improvements recommended but not
                            immediately critical. These suggestions focus on
                            enhancing code quality, following best practices,
                            and preventing future technical debt.
                        </Section.Content>
                    </Section.Root>

                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="font-bold text-foreground">
                                High Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-sm text-muted-foreground">
                            Significant issues that should be addressed in the
                            near term. These represent important improvements
                            needed in code quality, potential risks, or
                            substantial technical improvements that would
                            notably enhance the codebase.
                        </Section.Content>
                    </Section.Root>

                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="font-bold text-foreground">
                                Critical Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-sm text-muted-foreground">
                            Issues that require immediate attention and could
                            severely impact system stability, security, or
                            functionality. These problems typically represent
                            high-risk scenarios that could lead to system
                            failures, vulnerabilities, or significant technical
                            debt.
                        </Section.Content>
                    </Section.Root>
                </div>
            </DialogContent>
        </Dialog>
    );
};
