"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Button } from "@components/ui/button";
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
import { Switch } from "@components/ui/switch";
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
import { useEffect } from "react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { SeverityLevel } from "src/core/types";
import { cn } from "src/core/utils/components";

import CodeGroupingExampleCard from "../CodeGroupingExampleCard";
import { useAutomationCodeReviewConfig, usePlatformConfig } from "../context";
import GeneratingConfig from "./generating-config";
import {
    GroupingModeSuggestions,
    LimitationType,
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
                applyFiltersToKodyRules: false,
            },
        },
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
    });

    // Reinicializa o formulário quando config mudar
    useEffect(() => {
        if (config) {
            const formData = {
                ...config,
                suggestionControl: config?.suggestionControl ?? {
                    groupingMode: GroupingModeSuggestions.FULL,
                    limitationType: LimitationType.PR,
                    maxSuggestions: 9,
                    severityLevelFilter: SeverityLevel.MEDIUM,
                    applyFiltersToKodyRules: false,
                },
            };
            form.reset(formData);
        }
    }, [config, form]);

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
                applyFiltersToKodyRules: false,
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
                description: "Settings saved",
                variant: "success",
            });
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);

            toast({
                title: "Error",
                description:
                    "An error occurred while saving the settings. Please try again.",
                variant: "danger",
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
                        size="md"
                        variant="primary"
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
                    <small className="text-text-secondary text-sm">
                        Define how Kody consolidates multiple suggestions in a
                        single PR.
                    </small>
                </div>

                <div className="mt-3 flex flex-row gap-6">
                    <Controller
                        name="suggestionControl.groupingMode"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root className="flex-1">
                                <FormControl.Label htmlFor="groupingModeOptions">
                                    Choose mode:
                                </FormControl.Label>

                                <FormControl.Input>
                                    <ToggleGroup.Root
                                        id="groupingModeOptions"
                                        type="single"
                                        disabled={field.disabled}
                                        className="flex flex-1 flex-col gap-2"
                                        value={field.value}
                                        onValueChange={(value) => {
                                            if (value) field.onChange(value);
                                        }}>
                                        {GroupingModeOptions.map((option) => (
                                            <ToggleGroup.ToggleGroupItem
                                                asChild
                                                key={option.value}
                                                value={option.value}>
                                                <Button
                                                    size="md"
                                                    variant="helper"
                                                    className="h-auto w-full justify-between py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <Heading variant="h3">
                                                                {option.name}
                                                            </Heading>
                                                            {option.default && (
                                                                <small className="text-text-secondary">
                                                                    (default)
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Checkbox
                                                        decorative
                                                        checked={
                                                            field.value ===
                                                            option.value
                                                        }
                                                    />
                                                </Button>
                                            </ToggleGroup.ToggleGroupItem>
                                        ))}
                                    </ToggleGroup.Root>
                                </FormControl.Input>
                            </FormControl.Root>
                        )}
                    />

                    <div className="flex-2">
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
                        <small className="text-text-secondary text-sm">
                            Configure the number of comments Kody can leave
                            during code reviews
                        </small>
                    </div>

                    <Controller
                        name="suggestionControl.applyFiltersToKodyRules"
                        control={form.control}
                        render={({ field }) => (
                            <div className="flex items-center justify-between rounded-lg border border-card-lv3 bg-card-lv2 p-4">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-base font-medium text-text-primary">
                                        Apply filters to Kody Rules
                                    </h3>
                                    <p className="text-sm text-text-secondary">
                                        When OFF, Kody Rules suggestions bypass the limit and severity filters.
                                    </p>
                                </div>
                                <Switch
                                    id="applyFiltersToKodyRules"
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        field.onBlur();
                                    }}
                                    disabled={field.disabled}
                                    size="md"
                                />
                            </div>
                        )}
                    />

                    <Controller
                        name="suggestionControl.limitationType"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root className="space-y-1">
                                <FormControl.Label htmlFor="reviewOptions">
                                    Limitation type
                                </FormControl.Label>
                            </FormControl.Root>
                        )}
                    />

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
                                                <Button
                                                    size="md"
                                                    variant="helper"
                                                    className={cn(
                                                        "w-full justify-between py-4",
                                                    )}>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <Heading variant="h3">
                                                                {option.name}
                                                            </Heading>
                                                            {option.default && (
                                                                <small className="text-text-secondary">
                                                                    (default)
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Checkbox
                                                        decorative
                                                        checked={
                                                            field.value ===
                                                            option.value
                                                        }
                                                    />
                                                </Button>
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

                                return (
                                    <div className="mt-6">
                                        <Heading variant="h2">
                                            Minimum severity level
                                        </Heading>
                                        <small className="text-text-secondary text-sm">
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
                                                        value={numberValue}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
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
                                size="sm"
                                variant="secondary"
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Severity levels</DialogTitle>
                </DialogHeader>

                <div className="text-text-secondary flex flex-col gap-4 overflow-y-auto text-sm">
                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="text-text-primary font-bold">
                                Low Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-text-secondary text-sm">
                            Minor enhancements that would improve code quality.
                            These represent small optimizations, style
                            improvements, or subtle refinements that would
                            incrementally better the codebase.
                        </Section.Content>
                    </Section.Root>

                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="text-text-primary font-bold">
                                Medium Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-text-secondary text-sm">
                            Moderate improvements recommended but not
                            immediately critical. These suggestions focus on
                            enhancing code quality, following best practices,
                            and preventing future technical debt.
                        </Section.Content>
                    </Section.Root>

                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="text-text-primary font-bold">
                                High Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-text-secondary text-sm">
                            Significant issues that should be addressed in the
                            near term. These represent important improvements
                            needed in code quality, potential risks, or
                            substantial technical improvements that would
                            notably enhance the codebase.
                        </Section.Content>
                    </Section.Root>

                    <Section.Root className="gap-0">
                        <Section.Header>
                            <Section.Title className="text-text-primary font-bold">
                                Critical Level
                            </Section.Title>
                        </Section.Header>

                        <Section.Content className="text-text-secondary text-sm">
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
