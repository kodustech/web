"use client";

import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { Label } from "@components/ui/label";
import { Page } from "@components/ui/page";
import { Switch } from "@components/ui/switch";
import { toast } from "@components/ui/toaster/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAsyncAction } from "@hooks/use-async-action";
import { updateCockpitMetricsVisibility } from "@services/organizationParameters/fetch";
import { CockpitMetricsVisibility } from "@services/parameters/types";
import { Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";
import { z } from "zod";

const createSettingsSchema = () =>
    z.object({
        cockpitMetricsVisibility: z.object({
            summary: z.object({
                deployFrequency: z.boolean(),
                prCycleTime: z.boolean(),
                kodySuggestions: z.boolean(),
                bugRatio: z.boolean(),
                prSize: z.boolean(),
            }),
            details: z.object({
                leadTimeBreakdown: z.boolean(),
                prCycleTime: z.boolean(),
                prsOpenedVsClosed: z.boolean(),
                prsMergedByDeveloper: z.boolean(),
                teamActivity: z.boolean(),
            }),
        }),
    });

type SettingsFormData = z.infer<ReturnType<typeof createSettingsSchema>>;

export const CockpitOrganizationSettingsPage = (props: {
    cockpitMetricsVisibility: CockpitMetricsVisibility;
}) => {
    const router = useRouter();

    const form = useForm<SettingsFormData>({
        mode: "onChange",
        resolver: zodResolver(createSettingsSchema()),
        defaultValues: {
            cockpitMetricsVisibility: props.cockpitMetricsVisibility,
        },
    });

    const {
        control,
        handleSubmit,
        formState: { isDirty, isValid },
    } = form;

    const [saveSettings, { loading: isLoadingSubmitButton }] = useAsyncAction(
        async (data: SettingsFormData) => {
            try {
                await updateCockpitMetricsVisibility({
                    config: data.cockpitMetricsVisibility,
                });

                await revalidateServerSidePath("/organization/cockpit");
                router.refresh();

                toast({ description: "Settings saved", variant: "success" });
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "danger",
                });
                console.error(error);
            }
        },
    );

    return (
        <Page.Root>
            <form onSubmit={handleSubmit(saveSettings)}>
                <Page.Header>
                    <Page.Title>Cockpit Metrics Configuration</Page.Title>
                    <Page.HeaderActions>
                        <Button
                            type="submit"
                            size="md"
                            variant="primary"
                            leftIcon={<Save />}
                            disabled={
                                !isDirty || !isValid || isLoadingSubmitButton
                            }
                            loading={isLoadingSubmitButton}>
                            Save settings
                        </Button>
                    </Page.HeaderActions>
                </Page.Header>

                <Page.Content className="flex flex-col gap-8">
                    <Card color="lv1" className="w-full max-w-3xl">
                        <CardHeader>
                            <FormControl.Root className="flex flex-col">
                                <FormControl.Label className="mb-0 text-base font-bold">
                                    Summary Metrics
                                </FormControl.Label>
                                <FormControl.Helper className="mt-0 mb-5">
                                    Configure which metrics appear in the
                                    summary section at the top of the cockpit
                                </FormControl.Helper>

                                <div className="flex flex-col gap-3">
                                    <Controller
                                        name="cockpitMetricsVisibility.summary.deployFrequency"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        Deploy Frequency
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        How often your team
                                                        deploys to production
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.summary.prCycleTime"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        PR Cycle Time
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Average time from PR
                                                        creation to merge
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.summary.kodySuggestions"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        Kody Suggestions
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Code review suggestions
                                                        from Kody AI
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.summary.bugRatio"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        Bug Ratio
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Percentage of bugs in
                                                        your codebase
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.summary.prSize"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        PR Size
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Average size of pull
                                                        requests
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </FormControl.Root>
                        </CardHeader>
                    </Card>

                    <Card color="lv1" className="w-full max-w-3xl">
                        <CardHeader>
                            <FormControl.Root className="flex flex-col">
                                <FormControl.Label className="mb-0 text-base font-bold">
                                    Detail Metrics
                                </FormControl.Label>
                                <FormControl.Helper className="mt-0 mb-5">
                                    Configure which metrics appear in the
                                    detailed charts section
                                </FormControl.Helper>

                                <div className="flex flex-col gap-3">
                                    <Controller
                                        name="cockpitMetricsVisibility.details.leadTimeBreakdown"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        Lead Time Breakdown
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Detailed breakdown of
                                                        lead time stages
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.details.prCycleTime"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        PR Cycle Time Chart
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Detailed PR cycle time
                                                        over time
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.details.prsOpenedVsClosed"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        PRs Opened vs Closed
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Comparison of opened and
                                                        closed pull requests
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.details.prsMergedByDeveloper"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        PRs Merged by Developer
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Number of PRs merged per
                                                        team member
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name="cockpitMetricsVisibility.details.teamActivity"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-sm font-medium">
                                                        Team Activity
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
                                                        Overall team activity
                                                        and contributions
                                                    </p>
                                                </div>
                                                <Switch
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </div>
                                        )}
                                    />
                                </div>
                            </FormControl.Root>
                        </CardHeader>
                    </Card>
                </Page.Content>
            </form>
        </Page.Root>
    );
};
