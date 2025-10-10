"use client";

import { Suspense, useEffect, useRef } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { Textarea } from "@components/ui/textarea";
import { toast } from "@components/ui/toaster/use-toast";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { PARAMETERS_PATHS } from "@services/parameters";
import { createOrUpdateCodeReviewParameter } from "@services/parameters/fetch";
import { CodeReviewV2Defaults } from "@services/parameters/hooks";
import {
    KodyLearningStatus,
    ParametersConfigKey,
} from "@services/parameters/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { SaveIcon } from "lucide-react";
import { Controller, Path, useFormContext } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { unformatConfig } from "src/core/utils/helpers";

import { CodeReviewPagesBreadcrumb } from "../../_components/breadcrumb";
import GeneratingConfig from "../../_components/generating-config";
import { OverrideIndicatorForm } from "../../_components/override";
import { type CodeReviewFormType } from "../../_types";
import {
    useDefaultCodeReviewConfig,
    usePlatformConfig,
} from "../../../_components/context";
import { useCodeReviewRouteParams } from "../../../_hooks";

function CustomPromptsContent() {
    const platformConfig = usePlatformConfig();
    const form = useFormContext<CodeReviewFormType>();
    const { teamId } = useSelectedTeamId();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const { resetQueries, generateQueryKey } = useReactQueryInvalidateQueries();
    const defaults = useDefaultCodeReviewConfig()
        ?.v2PromptOverrides as CodeReviewV2Defaults;
    const initialized = useRef(false);

    if (!defaults) {
        return null;
    }

    const canEdit = usePermission(
        Action.Update,
        ResourceType.CodeReviewSettings,
        repositoryId,
    );

    const handleSubmit = form.handleSubmit(async (formData) => {
        try {
            const unformattedConfig = unformatConfig(formData);

            const result = await createOrUpdateCodeReviewParameter(
                unformattedConfig,
                teamId,
                repositoryId,
                directoryId,
            );

            if (result.error) {
                throw new Error(`Failed to save settings: ${result.error}`);
            }

            await Promise.all([
                resetQueries({
                    queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                        params: {
                            key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                            teamId,
                        },
                    }),
                }),
                resetQueries({
                    queryKey: generateQueryKey(
                        PARAMETERS_PATHS.GET_CODE_REVIEW_PARAMETER,
                        {
                            params: {
                                teamId,
                            },
                        },
                    ),
                }),
            ]);

            form.reset(formData);

            toast({
                description: "Settings saved",
                variant: "success",
            });
        } catch (error) {
            console.error("Error saving settings:", error);

            toast({
                title: "Error",
                description:
                    "An error occurred while saving the settings. Please try again.",
                variant: "danger",
            });
        }
    });

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

    // Prefill with defaults only once if fields are empty (no value saved)
    useEffect(() => {
        if (initialized.current) return;
        if (!defaults) return;

        const current = form.getValues();

        const map: Array<[Path<CodeReviewFormType>, string | undefined]> = [
            [
                "v2PromptOverrides.categories.descriptions.bug.value",
                defaults.categories.bug,
            ],
            [
                "v2PromptOverrides.categories.descriptions.performance.value",
                defaults.categories.performance,
            ],
            [
                "v2PromptOverrides.categories.descriptions.security.value",
                defaults.categories.security,
            ],
            [
                "v2PromptOverrides.severity.flags.critical.value",
                defaults.severity.critical,
            ],
            [
                "v2PromptOverrides.severity.flags.high.value",
                defaults.severity.high,
            ],
            [
                "v2PromptOverrides.severity.flags.medium.value",
                defaults.severity.medium,
            ],
            [
                "v2PromptOverrides.severity.flags.low.value",
                defaults.severity.low,
            ],
        ];

        let changed = false;
        map.forEach(([path, value]) => {
            const currentValue = (current as any)?.v2PromptOverrides
                ? path.split(".").reduce<any>((acc, key) => acc?.[key], current)
                : undefined;

            if (!currentValue || String(currentValue).trim() === "") {
                form.setValue(path, value ?? "", { shouldDirty: false });
                changed = true;
            }
        });

        if (changed) initialized.current = true;
    }, [defaults]);
    // Field-level helpers will compare and reset individually

    return (
        <Page.Root>
            <Page.Header>
                <CodeReviewPagesBreadcrumb pageName="Custom Prompts" />
            </Page.Header>

            <Page.Header>
                <Page.Title>Custom Prompts</Page.Title>

                <Page.HeaderActions>
                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<SaveIcon />}
                        onClick={handleSubmit}
                        disabled={!canEdit || !formIsDirty || !formIsValid}
                        loading={formIsSubmitting}>
                        Save settings
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content className="gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Prompts</CardTitle>
                        <CardDescription>
                            Set the prompt Kody uses for each category.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6">
                            <FormControl.Root>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="mb-2 flex flex-row items-center gap-2">
                                        <FormControl.Label
                                            className="mb-0"
                                            htmlFor="v2PromptOverrides.categories.descriptions.bug.value">
                                            Bug
                                        </FormControl.Label>
                                        <OverrideIndicatorForm fieldName="v2PromptOverrides.categories.descriptions.bug" />
                                    </div>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.bug.value"
                                        control={form.control}
                                        render={({ field }) => {
                                            const def =
                                                defaults?.categories.bug ?? "";
                                            const isDefault =
                                                (field.value || "").trim() ===
                                                def.trim();
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-6 min-h-auto px-2.5">
                                                        {isDefault
                                                            ? "Default"
                                                            : "Custom"}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="helper"
                                                        onClick={() =>
                                                            field.onChange(def)
                                                        }
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault
                                                        }>
                                                        Reset to default
                                                    </Button>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                                <FormControl.Helper className="mb-3">
                                    Prompt for Bugs (max 2000).
                                </FormControl.Helper>
                                <FormControl.Input>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.bug.value"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type the prompt for Bugs"
                                                    className="min-h-32"
                                                    maxLength={2000}
                                                    disabled={field.disabled}
                                                />
                                                <FormControl.Helper className="mt-2 block text-right text-xs">
                                                    {field.value?.length || 0} /
                                                    2000
                                                </FormControl.Helper>
                                            </div>
                                        )}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>

                            <FormControl.Root>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="mb-2 flex flex-row items-center gap-2">
                                        <FormControl.Label
                                            className="mb-0"
                                            htmlFor="v2PromptOverrides.categories.descriptions.performance.value">
                                            Performance
                                        </FormControl.Label>
                                        <OverrideIndicatorForm fieldName="v2PromptOverrides.categories.descriptions.performance" />
                                    </div>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.performance.value"
                                        control={form.control}
                                        render={({ field }) => {
                                            const def =
                                                defaults?.categories
                                                    .performance ?? "";
                                            const isDefault =
                                                (field.value || "").trim() ===
                                                def.trim();
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-6 min-h-auto px-2.5">
                                                        {isDefault
                                                            ? "Default"
                                                            : "Custom"}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="helper"
                                                        onClick={() =>
                                                            field.onChange(def)
                                                        }
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault
                                                        }>
                                                        Reset to default
                                                    </Button>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                                <FormControl.Helper className="mb-3">
                                    Prompt for Performance (max 2000).
                                </FormControl.Helper>
                                <FormControl.Input>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.performance.value"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type the prompt for Performance"
                                                    className="min-h-32"
                                                    maxLength={2000}
                                                    disabled={field.disabled}
                                                />
                                                <FormControl.Helper className="mt-2 block text-right text-xs">
                                                    {field.value?.length || 0} /
                                                    2000
                                                </FormControl.Helper>
                                            </div>
                                        )}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>

                            <FormControl.Root>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="mb-2 flex flex-row items-center gap-2">
                                        <FormControl.Label
                                            className="mb-0"
                                            htmlFor="v2PromptOverrides.categories.descriptions.security.value">
                                            Security
                                        </FormControl.Label>
                                        <OverrideIndicatorForm fieldName="v2PromptOverrides.categories.descriptions.security" />
                                    </div>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.security.value"
                                        control={form.control}
                                        render={({ field }) => {
                                            const def =
                                                defaults?.categories.security ??
                                                "";
                                            const isDefault =
                                                (field.value || "").trim() ===
                                                def.trim();
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-6 min-h-auto px-2.5">
                                                        {isDefault
                                                            ? "Default"
                                                            : "Custom"}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="helper"
                                                        onClick={() =>
                                                            field.onChange(def)
                                                        }
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault
                                                        }>
                                                        Reset to default
                                                    </Button>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                                <FormControl.Helper className="mb-3">
                                    Prompt for Security (max 2000).
                                </FormControl.Helper>
                                <FormControl.Input>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.security.value"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type the prompt for Security"
                                                    className="min-h-32"
                                                    maxLength={2000}
                                                    disabled={field.disabled}
                                                />
                                                <FormControl.Helper className="mt-2 block text-right text-xs">
                                                    {field.value?.length || 0} /
                                                    2000
                                                </FormControl.Helper>
                                            </div>
                                        )}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Severity Prompts</CardTitle>
                        <CardDescription>
                            Define how Kody classifies each severity level.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormControl.Root>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="mb-2 flex flex-row items-center gap-2">
                                        <FormControl.Label
                                            className="mb-0"
                                            htmlFor="v2PromptOverrides.severity.flags.critical.value">
                                            Critical
                                        </FormControl.Label>
                                        <OverrideIndicatorForm fieldName="v2PromptOverrides.severity.flags.critical" />
                                    </div>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.critical.value"
                                        control={form.control}
                                        render={({ field }) => {
                                            const def =
                                                defaults?.severity.critical ??
                                                "";
                                            const isDefault =
                                                (field.value || "").trim() ===
                                                def.trim();
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-6 min-h-auto px-2.5">
                                                        {isDefault
                                                            ? "Default"
                                                            : "Custom"}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="helper"
                                                        onClick={() =>
                                                            field.onChange(def)
                                                        }
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault
                                                        }>
                                                        Reset to default
                                                    </Button>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                                <FormControl.Helper className="mb-3">
                                    Prompt for Critical (max 2000).
                                </FormControl.Helper>
                                <FormControl.Input>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.critical.value"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type the prompt for Critical"
                                                    className="min-h-32"
                                                    maxLength={2000}
                                                    disabled={field.disabled}
                                                />
                                                <FormControl.Helper className="mt-2 block text-right text-xs">
                                                    {field.value?.length || 0} /
                                                    2000
                                                </FormControl.Helper>
                                            </div>
                                        )}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>

                            <FormControl.Root>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="mb-2 flex flex-row items-center gap-2">
                                        <FormControl.Label
                                            className="mb-0"
                                            htmlFor="v2PromptOverrides.severity.flags.high.value">
                                            High
                                        </FormControl.Label>
                                        <OverrideIndicatorForm fieldName="v2PromptOverrides.severity.flags.high" />
                                    </div>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.high.value"
                                        control={form.control}
                                        render={({ field }) => {
                                            const def =
                                                defaults?.severity.high ?? "";
                                            const isDefault =
                                                (field.value || "").trim() ===
                                                def.trim();
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-6 min-h-auto px-2.5">
                                                        {isDefault
                                                            ? "Default"
                                                            : "Custom"}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="helper"
                                                        onClick={() =>
                                                            field.onChange(def)
                                                        }
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault
                                                        }>
                                                        Reset to default
                                                    </Button>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                                <FormControl.Helper className="mb-3">
                                    Prompt for High (max 2000).
                                </FormControl.Helper>
                                <FormControl.Input>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.high.value"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type the prompt for High"
                                                    className="min-h-32"
                                                    maxLength={2000}
                                                    disabled={field.disabled}
                                                />
                                                <FormControl.Helper className="mt-2 block text-right text-xs">
                                                    {field.value?.length || 0} /
                                                    2000
                                                </FormControl.Helper>
                                            </div>
                                        )}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>

                            <FormControl.Root>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="mb-2 flex flex-row items-center gap-2">
                                        <FormControl.Label
                                            className="mb-0"
                                            htmlFor="v2PromptOverrides.severity.flags.medium.value">
                                            Medium
                                        </FormControl.Label>
                                        <OverrideIndicatorForm fieldName="v2PromptOverrides.severity.flags.medium" />
                                    </div>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.medium.value"
                                        control={form.control}
                                        render={({ field }) => {
                                            const def =
                                                defaults?.severity.medium ?? "";
                                            const isDefault =
                                                (field.value || "").trim() ===
                                                def.trim();
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-6 min-h-auto px-2.5">
                                                        {isDefault
                                                            ? "Default"
                                                            : "Custom"}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="helper"
                                                        onClick={() =>
                                                            field.onChange(def)
                                                        }
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault
                                                        }>
                                                        Reset to default
                                                    </Button>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                                <FormControl.Helper className="mb-3">
                                    Prompt for Medium (max 2000).
                                </FormControl.Helper>
                                <FormControl.Input>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.medium.value"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type the prompt for Medium"
                                                    className="min-h-32"
                                                    maxLength={2000}
                                                    disabled={field.disabled}
                                                />
                                                <FormControl.Helper className="mt-2 block text-right text-xs">
                                                    {field.value?.length || 0} /
                                                    2000
                                                </FormControl.Helper>
                                            </div>
                                        )}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>

                            <FormControl.Root>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="mb-2 flex flex-row items-center gap-2">
                                        <FormControl.Label
                                            className="mb-0"
                                            htmlFor="v2PromptOverrides.severity.flags.low.value">
                                            Low
                                        </FormControl.Label>
                                        <OverrideIndicatorForm fieldName="v2PromptOverrides.severity.flags.low" />
                                    </div>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.low.value"
                                        control={form.control}
                                        render={({ field }) => {
                                            const def =
                                                defaults?.severity.low ?? "";
                                            const isDefault =
                                                (field.value || "").trim() ===
                                                def.trim();
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="h-6 min-h-auto px-2.5">
                                                        {isDefault
                                                            ? "Default"
                                                            : "Custom"}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="helper"
                                                        onClick={() =>
                                                            field.onChange(def)
                                                        }
                                                        disabled={
                                                            !canEdit ||
                                                            isDefault
                                                        }>
                                                        Reset to default
                                                    </Button>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                                <FormControl.Helper className="mb-3">
                                    Prompt for Low (max 2000).
                                </FormControl.Helper>
                                <FormControl.Input>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.low.value"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type the prompt for Low"
                                                    className="min-h-32"
                                                    maxLength={2000}
                                                    disabled={field.disabled}
                                                />
                                                <FormControl.Helper className="mt-2 block text-right text-xs">
                                                    {field.value?.length || 0} /
                                                    2000
                                                </FormControl.Helper>
                                            </div>
                                        )}
                                    />
                                </FormControl.Input>
                            </FormControl.Root>
                        </div>
                    </CardContent>
                </Card>
            </Page.Content>
        </Page.Root>
    );
}

export default function CustomPrompts() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full w-full items-center justify-center py-10">
                    <Spinner className="size-6" />
                </div>
            }>
            <CustomPromptsContent />
        </Suspense>
    );
}
