"use client";

import { useEffect, useRef } from "react";
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
import { Textarea } from "@components/ui/textarea";
import { toast } from "@components/ui/toaster/use-toast";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { PARAMETERS_PATHS } from "@services/parameters";
import { createOrUpdateCodeReviewParameter } from "@services/parameters/fetch";
import { useSuspenseGetCodeReviewV2Defaults } from "@services/parameters/hooks";
import {
    KodyLearningStatus,
    ParametersConfigKey,
} from "@services/parameters/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { SaveIcon } from "lucide-react";
import { Controller, Path, useFormContext } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { CodeReviewPagesBreadcrumb } from "../../_components/breadcrumb";
import GeneratingConfig from "../../_components/generating-config";
import { type CodeReviewFormType } from "../../_types";
import { usePlatformConfig } from "../../../_components/context";
import { useCodeReviewRouteParams } from "../../../_hooks";

export default function CustomPrompts() {
    const platformConfig = usePlatformConfig();
    const form = useFormContext<CodeReviewFormType>();
    const { teamId } = useSelectedTeamId();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const { resetQueries, generateQueryKey } = useReactQueryInvalidateQueries();
    const defaults = useSuspenseGetCodeReviewV2Defaults();
    const initialized = useRef(false);

    const canEdit = usePermission(
        Action.Update,
        ResourceType.CodeReviewSettings,
        repositoryId,
    );

    const handleSubmit = form.handleSubmit(async (formData) => {
        try {
            const result = await createOrUpdateCodeReviewParameter(
                formData,
                teamId,
                repositoryId,
                directoryId,
            );

            if (result.error) {
                throw new Error(`Failed to save settings: ${result.error}`);
            }

            await resetQueries({
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            });

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
                "v2PromptOverrides.categories.descriptions.bug",
                defaults.categories.bug,
            ],
            [
                "v2PromptOverrides.categories.descriptions.performance",
                defaults.categories.performance,
            ],
            [
                "v2PromptOverrides.categories.descriptions.security",
                defaults.categories.security,
            ],
            [
                "v2PromptOverrides.severity.flags.critical",
                defaults.severity.critical,
            ],
            ["v2PromptOverrides.severity.flags.high", defaults.severity.high],
            [
                "v2PromptOverrides.severity.flags.medium",
                defaults.severity.medium,
            ],
            ["v2PromptOverrides.severity.flags.low", defaults.severity.low],
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
                                    <FormControl.Label
                                        className="mb-0"
                                        htmlFor="v2PromptOverrides.categories.descriptions.bug">
                                        Bug
                                    </FormControl.Label>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.bug"
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
                                                        {isDefault ? "Default" : "Custom"}
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
                                        name="v2PromptOverrides.categories.descriptions.bug"
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
                                    <FormControl.Label
                                        className="mb-0"
                                        htmlFor="v2PromptOverrides.categories.descriptions.performance">
                                        Performance
                                    </FormControl.Label>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.performance"
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
                                                        {isDefault ? "Default" : "Custom"}
                                                    </Badge>
                                                    <Button size="sm" variant="helper" onClick={() => field.onChange(def)} disabled={!canEdit || isDefault}>
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
                                        name="v2PromptOverrides.categories.descriptions.performance"
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
                                    <FormControl.Label
                                        className="mb-0"
                                        htmlFor="v2PromptOverrides.categories.descriptions.security">
                                        Security
                                    </FormControl.Label>
                                    <Controller
                                        name="v2PromptOverrides.categories.descriptions.security"
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
                                                        {isDefault ? "Default" : "Custom"}
                                                    </Badge>
                                                    <Button size="sm" variant="helper" onClick={() => field.onChange(def)} disabled={!canEdit || isDefault}>
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
                                        name="v2PromptOverrides.categories.descriptions.security"
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
                                    <FormControl.Label
                                        className="mb-0"
                                        htmlFor="v2PromptOverrides.severity.flags.critical">
                                        Critical
                                    </FormControl.Label>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.critical"
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
                                                        {isDefault ? "Default" : "Custom"}
                                                    </Badge>
                                                    <Button size="sm" variant="helper" onClick={() => field.onChange(def)} disabled={!canEdit || isDefault}>
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
                                        name="v2PromptOverrides.severity.flags.critical"
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
                                    <FormControl.Label
                                        className="mb-0"
                                        htmlFor="v2PromptOverrides.severity.flags.high">
                                        High
                                    </FormControl.Label>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.high"
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
                                                        {isDefault ? "Default" : "Custom"}
                                                    </Badge>
                                                    <Button size="sm" variant="helper" onClick={() => field.onChange(def)} disabled={!canEdit || isDefault}>
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
                                        name="v2PromptOverrides.severity.flags.high"
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
                                    <FormControl.Label
                                        className="mb-0"
                                        htmlFor="v2PromptOverrides.severity.flags.medium">
                                        Medium
                                    </FormControl.Label>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.medium"
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
                                                        {isDefault ? "Default" : "Custom"}
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
                                        name="v2PromptOverrides.severity.flags.medium"
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
                                    <FormControl.Label
                                        className="mb-0"
                                        htmlFor="v2PromptOverrides.severity.flags.low">
                                        Low
                                    </FormControl.Label>
                                    <Controller
                                        name="v2PromptOverrides.severity.flags.low"
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
                                                        {isDefault ? "Default" : "Custom"}
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
                                        name="v2PromptOverrides.severity.flags.low"
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
