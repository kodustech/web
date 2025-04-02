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
import { Button, buttonVariants } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";
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
import { cn } from "src/core/utils/components";

import {
    useAutomationCodeReviewConfig,
    usePlatformConfig,
} from "../../context";
import GeneratingConfig from "../generating-config";
import type {
    AutomationCodeReviewConfigPageProps,
    CodeReviewGlobalConfig,
    CodeReviewOptions,
} from "../types";
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

    const handleSubmit = form.handleSubmit(async ({ language, ...config }) => {
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
                title: "Success",
                description: "File downloaded successfully",
                variant: "default",
            });
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);

            toast({
                title: "Error",
                description:
                    "An error occurred while generating the yml file. Please try again.",
                variant: "destructive",
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
                        leftIcon={<Download />}
                        onClick={async () => await handleFileDownload()}
                        variant={"outline"}
                        loading={formIsSubmitting}>
                        Download{" "}
                        {repositoryId === "global" ? "Default" : "repository"}{" "}
                        YML configuration file
                    </Button>
                    <Button
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
                                <Card
                                    data-selected={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "h-auto cursor-pointer px-2 py-1",
                                    )}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <Heading variant="h3">
                                                Enable Automated Code Review
                                            </Heading>

                                            <p className="text-sm text-muted-foreground">
                                                Whenever a Pull Request is
                                                opened, Kody will automatically
                                                review the code, highlighting
                                                improvements, issues, and
                                                suggestions to ensure code
                                                quality.
                                            </p>
                                        </div>

                                        <Switch
                                            disabled
                                            checked={field.value}
                                            className="pointer-events-none !opacity-100"
                                        />
                                    </CardHeader>
                                </Card>
                            )}
                        />

                        <p className="text-xs text-muted-foreground">
                            When disabled, you can manually start the review by
                            using the command{" "}
                            <code className="mx-0.5 rounded-lg bg-background px-1.5 py-1 text-foreground">
                                @kody start-review
                            </code>{" "}
                            in the Pull Request comments.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Controller
                            name="kodusConfigFileOverridesWebPreferences"
                            control={form.control}
                            render={({ field }) => (
                                <Card
                                    data-selected={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "h-auto cursor-pointer px-2 py-1",
                                    )}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <Heading variant="h3">
                                                kodus Config File Overrides Web
                                                Preferences
                                            </Heading>

                                            <p className="text-sm text-muted-foreground">
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
                                            disabled
                                            checked={field.value}
                                            className="pointer-events-none !opacity-100"
                                        />
                                    </CardHeader>
                                </Card>
                            )}
                        />

                        <p className="text-xs text-muted-foreground">
                            Note:{" "}
                            <Link
                                href={`/settings/code-review/${repositoryId}/kody-rules`}
                                className="underline-offset-3 text-xs">
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
                                <Card
                                    data-selected={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "h-auto cursor-pointer px-2 py-1",
                                    )}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <Heading variant="h3">
                                                Enable Pull Request Approval
                                            </Heading>

                                            <p className="text-sm text-muted-foreground">
                                                When Kody completes an automated
                                                code review and finds no issues,
                                                it will automatically approve
                                                the Pull Request.
                                            </p>
                                        </div>

                                        <Switch
                                            disabled
                                            checked={field.value}
                                            className="pointer-events-none !opacity-100"
                                        />
                                    </CardHeader>
                                </Card>
                            )}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Controller
                            name="isRequestChangesActive"
                            disabled={isCodeManagementGitlab}
                            control={form.control}
                            render={({ field }) => (
                                <Card
                                    disabled={field.disabled}
                                    data-selected={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                    className={cn(
                                        buttonVariants({ variant: "outline" }),
                                        "h-auto cursor-pointer px-2 py-1",
                                        field.disabled && "cursor-not-allowed",
                                    )}>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <Heading variant="h3">
                                                Enable changing status of Review
                                                to 'Request Changes'
                                            </Heading>

                                            <p className="text-sm text-muted-foreground">
                                                When Kody completes an automated
                                                code review and finds critical
                                                issues, it will automatically
                                                change the status of it's Pull
                                                Request Review to 'Request
                                                Changes'.
                                            </p>
                                        </div>

                                        <Switch
                                            disabled
                                            checked={field.value}
                                            className="pointer-events-none !opacity-100"
                                        />
                                    </CardHeader>
                                </Card>
                            )}
                        />

                        <p className="text-xs text-muted-foreground">
                            Note: This option is not applicable to Gitlab.
                        </p>
                    </div>
                    <Controller
                        name="reviewOptions"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root className="space-y-1">
                                <FormControl.Label htmlFor="reviewOptions">
                                    Analysis types
                                </FormControl.Label>

                                <FormControl.Input>
                                    <ToggleGroup.Root
                                        id="reviewOptions"
                                        type="multiple"
                                        disabled={field.disabled}
                                        className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
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
                                                <Card
                                                    className={cn(
                                                        buttonVariants({
                                                            variant: "outline",
                                                        }),
                                                        "h-auto cursor-pointer items-start px-5 py-4 disabled:cursor-not-allowed",
                                                    )}>
                                                    <div className="flex h-full w-full items-start justify-between">
                                                        <div className="flex flex-col gap-2">
                                                            <Heading
                                                                variant="h3"
                                                                className="truncate">
                                                                {option.name}
                                                            </Heading>

                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    option.description
                                                                }
                                                            </p>
                                                        </div>

                                                        <Checkbox
                                                            disabled
                                                            className="pointer-events-none children:opacity-100 disabled:opacity-100"
                                                            checked={
                                                                field.value?.[
                                                                    option.value as keyof CodeReviewOptions
                                                                ]
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
                        name="ignorePaths"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor="ignore-paths">
                                    Ignored files
                                </FormControl.Label>
                                <FormControl.Helper className="mb-1 mt-0">
                                    Glob pattern for file path. One per line.
                                    Example: **/*.js
                                </FormControl.Helper>

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
                                <FormControl.Helper className="mb-1 mt-0">
                                    Ignore the review if the pull request title
                                    contains any of these keywords
                                    (case-insensitive). 100 characters maximum
                                    per keyword.
                                </FormControl.Helper>

                                <FormControl.Input>
                                    <TagInput
                                        id="ignored-title-keywords"
                                        disabled={field.disabled}
                                        tags={field.value}
                                        placeholder="Press Enter to add a title"
                                        onTagsChange={field.onChange}
                                    />
                                </FormControl.Input>
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
                                <FormControl.Helper className="mb-1 mt-0">
                                    Base branches (besides the default branch)
                                    to review. Examples: "dev, release, master".
                                    100 characters maximum per branch.
                                </FormControl.Helper>

                                <FormControl.Input>
                                    <TagInput
                                        id="base-branches"
                                        disabled={field.disabled}
                                        tags={field.value}
                                        placeholder="Press Enter to add a branch"
                                        onTagsChange={field.onChange}
                                    />
                                </FormControl.Input>
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
