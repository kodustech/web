"use client";

import { useRouter } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Button } from "@components/ui/button";
import { CardHeader } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Input } from "@components/ui/input";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import TagInput from "@components/ui/tag-input";
import { Textarea } from "@components/ui/textarea";
import { toast } from "@components/ui/toaster/use-toast";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { PARAMETERS_PATHS } from "@services/parameters";
import {
    createOrUpdateCodeReviewParameter,
    createOrUpdateParameter,
    getGenerateKodusConfigFile,
} from "@services/parameters/fetch";
import {
    useSuspenseGetCodeReviewLabels,
    useSuspenseGetParameterByKey,
} from "@services/parameters/hooks";
import {
    KodyLearningStatus,
    LanguageValue,
    ParametersConfigKey,
} from "@services/parameters/types";
import { useSuspenseGetConnections } from "@services/setup/hooks";
import { Download, Save } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { PlatformType } from "src/core/types";

import {
    useAutomationCodeReviewConfig,
    usePlatformConfig,
} from "../../context";
import GeneratingConfig from "../generating-config";
import type {
    AutomationCodeReviewConfigPageProps,
    CodeReviewGlobalConfig,
    CodeReviewOptions,
    ReviewCadence,
} from "../types";
import { ReviewCadenceType } from "../types";
import { LanguageSelector } from "./_components/language-selector";

interface CheckboxCardOption {
    value: string;
    name: string;
    description: string;
}

const hasGitLabConnection = (
    connections: ReturnType<typeof useSuspenseGetConnections>,
): boolean => {
    return connections
        .filter((c) => c.category === "CODE_MANAGEMENT" && c.hasConnection)
        .some((connection) => connection.platformName === PlatformType.GITLAB);
};

export const General = (props: AutomationCodeReviewConfigPageProps) => {
    const platformConfig = usePlatformConfig();

    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const { removeQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const connections = useSuspenseGetConnections(teamId);
    const isCodeManagementGitlab = hasGitLabConnection(connections);

    const { repositoryId } = props;

    const labels = useSuspenseGetCodeReviewLabels();
    const reviewOptionsOptions: CheckboxCardOption[] = labels.map(
        (label: any) => ({
            value: label.type,
            name: label.name,
            description: label.description,
        }),
    );

    const config = useAutomationCodeReviewConfig(props.repositoryId);
    const parameters = useSuspenseGetParameterByKey<string>(
        ParametersConfigKey.LANGUAGE_CONFIG,
        teamId,
        {
            fallbackData: {
                uuid: "",
                configKey: "",
                configValue: LanguageValue.ENGLISH,
            },
        },
    );

    const language =
        (parameters?.configValue as LanguageValue) ?? LanguageValue.ENGLISH;

    const form = useForm<CodeReviewGlobalConfig & { language: LanguageValue }>({
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        defaultValues: {
            ...config,
            language,
            automatedReviewActive: config?.automatedReviewActive ?? false,
            reviewCadence: config?.reviewCadence ?? (config?.automatedReviewActive ? {
                type: ReviewCadenceType.AUTOMATIC,
                timeWindow: 15,
                pushesToTrigger: 3,
            } : undefined),
            ignorePaths: config?.ignorePaths ?? [],
            ignoredTitleKeywords: config?.ignoredTitleKeywords ?? [],
            baseBranches: config?.baseBranches ?? [],
            kodusConfigFileOverridesWebPreferences:
                config?.kodusConfigFileOverridesWebPreferences ?? false,
            pullRequestApprovalActive:
                config?.pullRequestApprovalActive ?? false,
            isRequestChangesActive: config?.isRequestChangesActive ?? false,
            reviewOptions: {
                code_style: config?.reviewOptions?.code_style ?? false,
                documentation_and_comments:
                    config?.reviewOptions?.documentation_and_comments ?? false,
                error_handling: config?.reviewOptions?.error_handling ?? false,
                maintainability:
                    config?.reviewOptions?.maintainability ?? false,
                performance_and_optimization:
                    config?.reviewOptions?.performance_and_optimization ??
                    false,
                potential_issues:
                    config?.reviewOptions?.potential_issues ?? false,
                refactoring: config?.reviewOptions?.refactoring ?? false,
                security: config?.reviewOptions?.security ?? false,
                kody_rules: config?.reviewOptions?.kody_rules ?? false,
                breaking_changes:
                    config?.reviewOptions?.breaking_changes ?? false,
            },
            kodyRulesGeneratorEnabled:
                config?.kodyRulesGeneratorEnabled ?? true,
        },
    });

            const handleSubmit = form.handleSubmit(async (formData) => {
        const { language, ...config } = formData;

        // Remove reviewCadence when automation is disabled
        if (!formData.automatedReviewActive) {
            delete config.reviewCadence;
        }

        try {
            const [languageResult, reviewResult] = await Promise.all([
                createOrUpdateParameter(
                    ParametersConfigKey.LANGUAGE_CONFIG,
                    language,
                    teamId,
                ),
                createOrUpdateCodeReviewParameter(
                    config,
                    teamId,
                    repositoryId === "global" ? undefined : repositoryId,
                ),
            ]);

            if (languageResult.error || reviewResult.error) {
                throw new Error(
                    `Failed to save settings: ${[
                        languageResult.error,
                        reviewResult.error,
                    ]
                        .filter(Boolean)
                        .join(", ")}`,
                );
            }

            await removeQueries({
                type: "all",
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            });

            form.reset({ ...config, language });

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

    const handleFileDownload = async () => {
        try {
            const downloadFile = await getGenerateKodusConfigFile(
                teamId,
                repositoryId,
            );

            const blob = new Blob([downloadFile], { type: "text/yaml" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;

            a.download = "kodus-config.yml";

            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
                description: "File downloaded",
                variant: "success",
            });
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);

            toast({
                title: "Error",
                description:
                    "An error occurred while generating the yml file. Please try again.",
                variant: "danger",
            });
        }
    };

    const labelTypeToKey: Record<string, keyof CodeReviewOptions> = {
        performance_and_optimization: "performance_and_optimization",
        security: "security",
        error_handling: "error_handling",
        refactoring: "refactoring",
        maintainability: "maintainability",
        potential_issues: "potential_issues",
        code_style: "code_style",
        documentation_and_comments: "documentation_and_comments",
        kody_rules: "kody_rules",
        breaking_changes: "breaking_changes",
    };

    const mapToReviewOptions = (
        values: Record<string, boolean> = {},
    ): CodeReviewOptions => {
        const options: Partial<CodeReviewOptions> = {};

        Object.keys(values).forEach((key) => {
            const mappedKey = labelTypeToKey[key];
            if (mappedKey) {
                options[mappedKey] = values[key];
            } else {
                console.warn(`Chave não mapeada: ${key}`);
            }
        });

        return {
            security: options.security || false,
            code_style: options.code_style || false,
            refactoring: options.refactoring || false,
            error_handling: options.error_handling || false,
            maintainability: options.maintainability || false,
            potential_issues: options.potential_issues || false,
            documentation_and_comments:
                options.documentation_and_comments || false,
            performance_and_optimization:
                options.performance_and_optimization || false,
            kody_rules: options.kody_rules || false,
            breaking_changes: options.breaking_changes || false,
        };
    };

    const mapReviewOptionsToValues = (
        reviewOptions: CodeReviewOptions,
    ): Record<string, boolean> => {
        const values: Record<string, boolean> = {};
        Object.keys(labelTypeToKey).forEach((key) => {
            const optionKey = labelTypeToKey[key];
            values[key] = reviewOptions[optionKey];
        });

        return values;
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
                            <BreadcrumbPage>General</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </Page.Header>

            <Page.Header>
                <Page.Title>General settings</Page.Title>
                <Page.HeaderActions>
                    <Button
                        size="md"
                        leftIcon={<Download />}
                        onClick={async () => await handleFileDownload()}
                        variant="secondary"
                        loading={formIsSubmitting}>
                        Download{" "}
                        {repositoryId === "global" ? "Default" : "repository"}{" "}
                        YML configuration file
                    </Button>

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

            <Page.Content>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <Controller
                            name="automatedReviewActive"
                            control={form.control}
                            render={({ field }) => (
                                <div className="w-full">
                                    <Button
                                        size="sm"
                                        variant="helper"
                                        className="w-full"
                                                                                onClick={() => {
                                            const newValue = !field.value;
                                            field.onChange(newValue);

                                            if (newValue) {
                                                // Enabling automation - set default reviewCadence
                                                const currentCadence = form.getValues("reviewCadence");
                                                if (!currentCadence?.type) {
                                                    form.setValue("reviewCadence.type", ReviewCadenceType.AUTOMATIC, { shouldDirty: true });
                                                }
                                                form.trigger();
                                            } else {
                                                // Disabling automation - clear reviewCadence
                                                form.setValue("reviewCadence", undefined, { shouldDirty: true });
                                                form.trigger();
                                            }
                                        }}>
                                        <CardHeader className="flex flex-row items-center justify-between gap-6">
                                            <div className="flex flex-col gap-1">
                                                <Heading variant="h3">
                                                    Enable Automated Code Review
                                                </Heading>

                                                <p className="text-text-secondary text-sm">
                                                    Whenever a Pull Request is
                                                    opened, Kody will automatically
                                                    review the code, highlighting
                                                    improvements, issues, and
                                                    suggestions to ensure code
                                                    quality.
                                                </p>
                                                <p className="text-text-tertiary text-sm">
                                                    When disabled, you can manually
                                                    start the review by using the
                                                    command{" "}
                                                    <code className="bg-background text-text-primary mx-0.5 rounded-lg px-1.5 py-1">
                                                        @kody start-review
                                                    </code>{" "}
                                                    in the Pull Request comments.
                                                </p>
                                            </div>

                                            <Switch
                                                decorative
                                                checked={field.value}
                                            />
                                        </CardHeader>
                                    </Button>

                                    {field.value && (
                                        <div className="mt-2 flex flex-col gap-4 border-card-lv3 bg-card-lv2 rounded-xl border p-4">
                                            <Controller
                                                name="reviewCadence.type"
                                                control={form.control}
                                                render={({ field: cadenceField }) => (
                                                    <FormControl.Root>
                                                        <FormControl.Label htmlFor="review-cadence">
                                                            Review Cadence
                                                        </FormControl.Label>
                                                        <FormControl.Helper className="text-text-secondary mb-2 text-xs">
                                                            Decide how Kody should run
                                                            follow‑up reviews after the
                                                            first one.
                                                        </FormControl.Helper>

                                                        <FormControl.Input>
                                                            <Select
                                                                value={cadenceField.value || ReviewCadenceType.AUTOMATIC}
                                                                onValueChange={cadenceField.onChange}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select review cadence" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem
                                                                        value={ReviewCadenceType.AUTOMATIC}>
                                                                        Automatic
                                                                    </SelectItem>
                                                                    <SelectItem
                                                                        value={ReviewCadenceType.AUTO_PAUSE}>
                                                                        Auto-pause
                                                                    </SelectItem>
                                                                    <SelectItem
                                                                        value={ReviewCadenceType.MANUAL}>
                                                                        Manual
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl.Input>

                                                        <FormControl.Helper className="text-text-secondary text-xs">
                                                            {(cadenceField.value || ReviewCadenceType.AUTOMATIC) === ReviewCadenceType.AUTOMATIC &&
                                                                "Review every new push"}
                                                            {(cadenceField.value || ReviewCadenceType.AUTOMATIC) === ReviewCadenceType.AUTO_PAUSE &&
                                                                "Pause if a push burst is detected."}
                                                            {(cadenceField.value || ReviewCadenceType.AUTOMATIC) === ReviewCadenceType.MANUAL &&
                                                                "Only run when you comment @kody start‑review."}
                                                        </FormControl.Helper>
                                                    </FormControl.Root>
                                                )}
                                            />

                                            {(form.watch("reviewCadence.type") || ReviewCadenceType.AUTOMATIC) === ReviewCadenceType.AUTO_PAUSE && (
                                                <div className="flex flex-row gap-4">
                                                    <Controller
                                                        name="reviewCadence.pushesToTrigger"
                                                        control={form.control}
                                                        render={({ field: pushesField }) => (
                                                            <FormControl.Root className="flex-1">
                                                                <FormControl.Label htmlFor="pushes-to-trigger">
                                                                    Pushes to trigger pause
                                                                </FormControl.Label>
                                                                <FormControl.Input>
                                                                    <Input
                                                                        id="pushes-to-trigger"
                                                                        type="number"
                                                                        min="1"
                                                                        value={pushesField.value || 3}
                                                                        onChange={(e) =>
                                                                            pushesField.onChange(
                                                                                parseInt(e.target.value) || 3,
                                                                            )
                                                                        }
                                                                    />
                                                                </FormControl.Input>
                                                            </FormControl.Root>
                                                        )}
                                                    />

                                                    <Controller
                                                        name="reviewCadence.timeWindow"
                                                        control={form.control}
                                                        render={({ field: timeField }) => (
                                                            <FormControl.Root className="flex-1">
                                                                <FormControl.Label htmlFor="time-window">
                                                                    Time window (minutes)
                                                                </FormControl.Label>
                                                                <FormControl.Input>
                                                                    <Input
                                                                        id="time-window"
                                                                        type="number"
                                                                        min="1"
                                                                        value={timeField.value || 15}
                                                                        onChange={(e) =>
                                                                            timeField.onChange(
                                                                                parseInt(e.target.value) || 15,
                                                                            )
                                                                        }
                                                                    />
                                                                </FormControl.Input>
                                                            </FormControl.Root>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Controller
                            name="kodusConfigFileOverridesWebPreferences"
                            control={form.control}
                            render={({ field }) => (
                                <Button
                                    size="sm"
                                    variant="helper"
                                    onClick={() => field.onChange(!field.value)}
                                    className="w-full">
                                    <CardHeader className="flex flex-row items-center justify-between gap-6">
                                        <div className="flex flex-col gap-1">
                                            <Heading variant="h3">
                                                kodus Config File Overrides Web
                                                Preferences
                                            </Heading>

                                            <p className="text-text-secondary text-sm">
                                                When the{" "}
                                                <strong>
                                                    kodus-config.yml{" "}
                                                </strong>{" "}
                                                is present in your repo, this
                                                property prioritizes settings in
                                                the kodusConfig file over web
                                                preferences. (this configuration
                                                can only be configured through
                                                the web interface and is not
                                                present in the configuration
                                                file)
                                            </p>
                                        </div>

                                        <Switch
                                            decorative
                                            checked={field.value}
                                        />
                                    </CardHeader>
                                </Button>
                            )}
                        />

                        <p className="text-text-secondary text-xs">
                            Note:{" "}
                            <Link
                                href={`/settings/code-review/${repositoryId}/kody-rules`}
                                className="text-xs underline-offset-3">
                                Kody Rules
                            </Link>{" "}
                            can only be configured through the web interface.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Controller
                            name="pullRequestApprovalActive"
                            control={form.control}
                            render={({ field }) => (
                                <Button
                                    size="sm"
                                    variant="helper"
                                    onClick={() => field.onChange(!field.value)}
                                    className="w-full">
                                    <CardHeader className="flex flex-row items-center justify-between gap-6">
                                        <div className="flex flex-col gap-1">
                                            <Heading variant="h3">
                                                Enable Pull Request Approval
                                            </Heading>

                                            <p className="text-text-secondary text-sm">
                                                When Kody completes an automated
                                                code review and finds no issues,
                                                it will automatically approve
                                                the Pull Request.
                                            </p>
                                        </div>

                                        <Switch
                                            decorative
                                            checked={field.value}
                                        />
                                    </CardHeader>
                                </Button>
                            )}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Controller
                            name="isRequestChangesActive"
                            disabled={isCodeManagementGitlab}
                            control={form.control}
                            render={({ field }) => (
                                <Button
                                    size="sm"
                                    variant="helper"
                                    disabled={field.disabled}
                                    onClick={() => field.onChange(!field.value)}
                                    className="w-full">
                                    <CardHeader className="flex flex-row items-center justify-between gap-6">
                                        <div className="flex flex-col gap-1">
                                            <Heading variant="h3">
                                                Enable changing status of Review
                                                to 'Request Changes'
                                            </Heading>

                                            <p className="text-text-secondary text-sm">
                                                When Kody completes an automated
                                                code review and finds critical
                                                issues, it will automatically
                                                change the status of it's Pull
                                                Request Review to 'Request
                                                Changes'.
                                            </p>
                                        </div>

                                        <Switch
                                            decorative
                                            checked={field.value}
                                        />
                                    </CardHeader>
                                </Button>
                            )}
                        />

                        <p className="text-text-secondary text-xs">
                            Note: This option is not applicable to Gitlab.
                        </p>
                    </div>
                    <Controller
                        name="reviewOptions"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root className="@container space-y-1">
                                <FormControl.Label htmlFor="reviewOptions">
                                    Analysis types
                                </FormControl.Label>

                                <FormControl.Input>
                                    <ToggleGroup.Root
                                        id="reviewOptions"
                                        type="multiple"
                                        disabled={field.disabled}
                                        className="grid auto-rows-fr grid-cols-1 gap-2 @lg:grid-cols-2 @3xl:grid-cols-3"
                                        value={Object.entries(
                                            mapReviewOptionsToValues(
                                                mapToReviewOptions(field.value),
                                            ),
                                        )
                                            .filter(([, value]) => value)
                                            .map(([key]) => key)}
                                        onValueChange={(values) => {
                                            const selectedOptions =
                                                mapToReviewOptions({
                                                    // get all options and set them to false
                                                    ...Object.fromEntries(
                                                        Object.keys(
                                                            field.value ?? {},
                                                        ).map((value) => [
                                                            value,
                                                            false,
                                                        ]),
                                                    ),

                                                    // then, set only selected options to true
                                                    ...Object.fromEntries(
                                                        values.map((value) => [
                                                            value,
                                                            true,
                                                        ]),
                                                    ),
                                                });

                                            field.onChange(selectedOptions);
                                        }}>
                                        {reviewOptionsOptions.map((option) => (
                                            <ToggleGroup.ToggleGroupItem
                                                asChild
                                                key={option.value}
                                                value={option.value}>
                                                <Button
                                                    size="lg"
                                                    variant="helper"
                                                    onClick={() =>
                                                        field.onChange(
                                                            !field.value,
                                                        )
                                                    }
                                                    className="w-full items-start py-5">
                                                    <div className="flex w-full flex-row justify-between gap-6">
                                                        <div className="flex flex-col gap-2">
                                                            <Heading
                                                                variant="h3"
                                                                className="truncate">
                                                                {option.name}
                                                            </Heading>

                                                            <p className="text-text-secondary text-xs">
                                                                {
                                                                    option.description
                                                                }
                                                            </p>
                                                        </div>

                                                        <Checkbox
                                                            decorative
                                                            checked={
                                                                field.value?.[
                                                                    option.value as keyof CodeReviewOptions
                                                                ]
                                                            }
                                                        />
                                                    </div>
                                                </Button>
                                            </ToggleGroup.ToggleGroupItem>
                                        ))}
                                    </ToggleGroup.Root>
                                </FormControl.Input>
                            </FormControl.Root>
                        )}
                    />

                    <Controller
                        name="ignorePaths"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor="ignore-paths">
                                    Ignored files
                                </FormControl.Label>

                                <FormControl.Input>
                                    <Textarea
                                        id="ignore-paths"
                                        disabled={field.disabled}
                                        defaultValue={field.value?.join("\n")}
                                        onChange={(ev) => {
                                            const text = ev.target.value;
                                            const ignorePaths = text
                                                .split("\n")
                                                .map((item) => item.trim())
                                                .filter((item) => item !== "");

                                            field.onChange(ignorePaths);
                                        }}
                                        placeholder={`List the files to be ignored here, one per line. Example:\n\nyarn.lock\npackage-lock.json\npackage.json\n.env`}
                                        maxLength={1000}
                                        className="min-h-40"
                                    />
                                </FormControl.Input>

                                <FormControl.Helper>
                                    Glob pattern for file path. One per line.
                                    Example: **/*.js
                                </FormControl.Helper>
                            </FormControl.Root>
                        )}
                    />

                    <Controller
                        name="ignoredTitleKeywords"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor="ignored-title-keywords">
                                    Ignore title keywords
                                </FormControl.Label>

                                <FormControl.Input>
                                    <TagInput
                                        id="ignored-title-keywords"
                                        disabled={field.disabled}
                                        tags={field.value}
                                        placeholder="Press Enter to add a title"
                                        onTagsChange={field.onChange}
                                    />
                                </FormControl.Input>

                                <FormControl.Helper>
                                    Ignore the review if the pull request title
                                    contains any of these keywords
                                    (case-insensitive). 100 characters maximum
                                    per keyword.
                                </FormControl.Helper>
                            </FormControl.Root>
                        )}
                    />

                    <Controller
                        name="baseBranches"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor="base-branches">
                                    Base Branches
                                </FormControl.Label>

                                <FormControl.Input>
                                    <TagInput
                                        id="base-branches"
                                        disabled={field.disabled}
                                        tags={field.value}
                                        placeholder="Press Enter to add a branch"
                                        onTagsChange={field.onChange}
                                    />
                                </FormControl.Input>

                                <FormControl.Helper>
                                    Base branches (besides the default branch)
                                    to review. Examples: "dev, release, master".
                                    100 characters maximum per branch.
                                </FormControl.Helper>
                            </FormControl.Root>
                        )}
                    />
                </div>

                {repositoryId === "global" && (
                    <FormProvider {...form}>
                        <LanguageSelector />
                    </FormProvider>
                )}
            </Page.Content>
        </Page.Root>
    );
};
