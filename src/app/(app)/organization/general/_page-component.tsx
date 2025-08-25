"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { FormControl } from "@components/ui/form-control";
import { Input } from "@components/ui/input";
import { Page } from "@components/ui/page";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { toast } from "@components/ui/toaster/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAsyncAction } from "@hooks/use-async-action";
import { createOrUpdateOrganizationParameter } from "@services/organizationParameters/fetch";
import {
    OrganizationParametersAutoJoinConfig,
    OrganizationParametersConfigKey,
    Timezone,
} from "@services/parameters/types";
import { Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { publicDomainsSet } from "src/core/utils/email";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";
import z from "zod";

const timezoneOptions = [
    { value: Timezone.NEW_YORK, title: "New York" },
    { value: Timezone.SAO_PAULO, title: "São Paulo" },
] satisfies Array<{ value: Timezone; title: string }>;

const createSettingsSchema = (userDomain: string) =>
    z
        .object({
            timezone: z.nativeEnum(Timezone),
            autoJoinConfig: z.object({
                enabled: z.boolean(),
                domains: z.array(z.string()),
            }),
        })
        .superRefine((data, ctx) => {
            if (data.autoJoinConfig.enabled) {
                const { domains } = data.autoJoinConfig;
                const validDomains = domains.filter((d) => d);

                if (validDomains.length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "At least one domain is required.",
                        path: ["autoJoinConfig", "domains"],
                    });
                    return;
                }

                const lowercaseDomains = validDomains.map((d) =>
                    d.toLowerCase(),
                );
                const isPublicDomain = lowercaseDomains.some((d) =>
                    publicDomainsSet.has(d),
                );

                if (isPublicDomain) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Public domains are not allowed.",
                        path: ["autoJoinConfig", "domains"],
                    });
                }

                if (validDomains.some((domain) => domain !== userDomain)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "You can only add your own domain.",
                        path: ["autoJoinConfig", "domains"],
                    });
                }
            }
        });

type SettingsFormData = z.infer<ReturnType<typeof createSettingsSchema>>;

export const GeneralOrganizationSettingsPage = (props: {
    email: string;
    timezone: Timezone;
    autoJoinConfig: OrganizationParametersAutoJoinConfig;
}) => {
    const { organizationId } = useOrganizationContext();
    const router = useRouter();
    const userDomain = props.email.split("@")[1];

    const form = useForm<SettingsFormData>({
        resolver: zodResolver(createSettingsSchema(userDomain)),
        defaultValues: {
            timezone: props.timezone,
            autoJoinConfig: props.autoJoinConfig,
        },
        mode: "onChange",
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isDirty, isValid },
    } = form;

    const [saveSettings, { loading: isLoadingSubmitButton }] = useAsyncAction(
        async (data: SettingsFormData) => {
            try {
                const promises: Promise<any>[] = [];

                if (data.timezone !== props.timezone) {
                    promises.push(
                        createOrUpdateOrganizationParameter(
                            OrganizationParametersConfigKey.TIMEZONE_CONFIG,
                            data.timezone,
                            organizationId,
                        ),
                    );
                }

                if (
                    JSON.stringify(data.autoJoinConfig) !==
                    JSON.stringify(props.autoJoinConfig)
                ) {
                    promises.push(
                        createOrUpdateOrganizationParameter(
                            OrganizationParametersConfigKey.AUTO_JOIN_CONFIG,
                            data.autoJoinConfig,
                            organizationId,
                        ),
                    );
                }

                if (promises.length === 0) return;

                await Promise.all(promises);
                await revalidateServerSidePath("/organization/general");
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
                    <Page.Title>General settings</Page.Title>
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
                    <Controller
                        name="timezone"
                        control={control}
                        render={({ field }) => (
                            <FormControl.Root>
                                <FormControl.Label htmlFor="timezone">
                                    Timezone
                                </FormControl.Label>
                                <FormControl.Input>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger
                                            id="timezone"
                                            className="w-72">
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timezoneOptions.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}>
                                                    {opt.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl.Input>
                            </FormControl.Root>
                        )}
                    />

                    <FormControl.Root className="flex flex-col gap-2">
                        <FormControl.Label>Auto Join</FormControl.Label>
                        <FormControl.Helper>
                            Allow users with matching email domains to
                            automatically join.
                        </FormControl.Helper>

                        <Controller
                            name="autoJoinConfig.enabled"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-2 pt-2">
                                    <Switch
                                        id="auto-join-enabled"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <label
                                        htmlFor="auto-join-enabled"
                                        className="text-sm font-medium">
                                        Enable Auto Join
                                    </label>
                                </div>
                            )}
                        />

                        <Controller
                            name="autoJoinConfig.domains"
                            control={control}
                            render={({ field }) => {
                                const autoJoinEnabled = form.watch(
                                    "autoJoinConfig.enabled",
                                );
                                return (
                                    <>
                                        <FormControl.Input>
                                            <Input
                                                id="auto-join-domains"
                                                placeholder="e.g., yourcompany.com"
                                                value={
                                                    field.value?.join(",") ?? ""
                                                }
                                                onChange={(e) => {
                                                    const inputValue =
                                                        e.target.value;

                                                    if (inputValue === "") {
                                                        field.onChange([]);
                                                        return;
                                                    }

                                                    const domains =
                                                        e.target.value
                                                            .split(/,\s*/)
                                                            .map((d) =>
                                                                d.trim(),
                                                            );
                                                    field.onChange(domains);
                                                }}
                                                disabled={!autoJoinEnabled}
                                                className="mt-2 w-72"
                                            />
                                        </FormControl.Input>
                                        <FormControl.Error>
                                            {
                                                errors.autoJoinConfig?.domains
                                                    ?.message
                                            }
                                        </FormControl.Error>
                                        <FormControl.Helper>
                                            Enter domains separated by commas.
                                        </FormControl.Helper>
                                    </>
                                );
                            }}
                        />
                    </FormControl.Root>
                </Page.Content>
            </form>
        </Page.Root>
    );
};
