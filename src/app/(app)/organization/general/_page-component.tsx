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
import { useAsyncAction } from "@hooks/use-async-action";
import { createOrUpdateOrganizationParameter } from "@services/organizationParameters/fetch";
import {
    OrganizationParametersAutoJoinConfig,
    OrganizationParametersConfigKey,
    Timezone,
} from "@services/parameters/types";
import { Save } from "lucide-react";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

const timezoneOptions = [
    { value: Timezone.NEW_YORK, title: "New York" },
    { value: Timezone.SAO_PAULO, title: "São Paulo" },
] satisfies Array<{ value: Timezone; title: string }>;

export const GeneralOrganizationSettingsPage = (props: {
    email: string;
    timezone: Timezone;
    autoJoinConfig: OrganizationParametersAutoJoinConfig;
}) => {
    const { organizationId } = useOrganizationContext();
    const [timezone, setTimezone] = useState<Timezone>(props.timezone);
    const [autoJoinConfig, setAutoJoinConfig] =
        useState<OrganizationParametersAutoJoinConfig>(props.autoJoinConfig);
    const router = useRouter();

    const hasChanges = useMemo(() => {
        const timezoneChanged = timezone !== props.timezone;
        const autoJoinConfigEnabledChanged =
            autoJoinConfig.enabled !== props.autoJoinConfig.enabled;
        const autoJoinConfigDomainsChanged =
            autoJoinConfig.domains.join(",") !==
            props.autoJoinConfig.domains.join(",");

        return (
            timezoneChanged ||
            autoJoinConfigEnabledChanged ||
            autoJoinConfigDomainsChanged
        );
    }, [autoJoinConfig, props.autoJoinConfig, timezone, props.timezone]);

    const [saveSettings, { loading: isLoadingSubmitButton }] = useAsyncAction(
        async () => {
            try {
                const promises: Promise<any>[] = [];

                if (timezone !== props.timezone) {
                    promises.push(
                        createOrUpdateOrganizationParameter(
                            OrganizationParametersConfigKey.TIMEZONE_CONFIG,
                            timezone,
                            organizationId,
                        ),
                    );
                }

                if (
                    autoJoinConfig.enabled !== props.autoJoinConfig.enabled ||
                    autoJoinConfig.domains.join(",") !==
                        props.autoJoinConfig.domains.join(",")
                ) {
                    const userDomain = props.email.split("@")[1];

                    const isDomainInvalid = autoJoinConfig.domains.some(
                        (domain) => domain !== userDomain,
                    );

                    if (isDomainInvalid) {
                        toast({
                            title: "Invalid Domain",
                            description:
                                "You can only add your own email's domain to the auto-join list.",
                            variant: "danger",
                        });
                        return;
                    }

                    promises.push(
                        createOrUpdateOrganizationParameter(
                            OrganizationParametersConfigKey.AUTO_JOIN_CONFIG,
                            autoJoinConfig,
                            organizationId,
                        ),
                    );
                }

                await Promise.all(promises);

                await revalidateServerSidePath("/organization/general");

                router.refresh();

                toast({
                    description: "Settings saved",
                    variant: "success",
                });
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

    const handleDomainsChange = (value: string) => {
        const domains = value
            .split(",")
            .map((domain) => domain.trim())
            .filter(Boolean);

        setAutoJoinConfig((prev) => ({ ...prev, domains }));
    };

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>General settings</Page.Title>
                <Page.HeaderActions>
                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<Save />}
                        disabled={!hasChanges}
                        onClick={saveSettings}
                        loading={isLoadingSubmitButton}>
                        Save settings
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content className="flex flex-col gap-8">
                <FormControl.Root>
                    <FormControl.Label htmlFor="timezone">
                        Timezone
                    </FormControl.Label>
                    <FormControl.Input>
                        <Select
                            value={timezone}
                            onValueChange={(value) =>
                                setTimezone(value as Timezone)
                            }>
                            <SelectTrigger id="timezone" className="w-72">
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                {timezoneOptions.map((timezoneOption) => (
                                    <SelectItem
                                        key={timezoneOption.value}
                                        value={timezoneOption.value}>
                                        {timezoneOption.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl.Input>
                </FormControl.Root>

                {/* <FormControl.Root className="flex flex-col gap-2">
                    <FormControl.Label>Auto Join</FormControl.Label>
                    <FormControl.Helper>
                        Allow users with matching email domains to automatically
                        join this organization.
                    </FormControl.Helper>

                    <div className="flex items-center gap-2 pt-2">
                        <Switch
                            id="auto-join-enabled"
                            checked={autoJoinConfig.enabled}
                            onCheckedChange={(enabled) =>
                                setAutoJoinConfig((prev) => ({
                                    ...prev,
                                    enabled,
                                }))
                            }
                        />
                        <label
                            htmlFor="auto-join-enabled"
                            className="text-sm font-medium">
                            Enable Auto Join
                        </label>
                    </div>

                    <FormControl.Input>
                        <Input
                            id="auto-join-domains"
                            placeholder="e.g., yourcompany.com, acme.dev"
                            value={autoJoinConfig.domains.join(", ")}
                            onChange={(e) =>
                                handleDomainsChange(e.target.value)
                            }
                            disabled={!autoJoinConfig.enabled}
                            className="mt-2 w-72"
                        />
                    </FormControl.Input>
                    <FormControl.Helper>
                        Enter domains separated by commas.
                    </FormControl.Helper>
                </FormControl.Root> */}
            </Page.Content>
        </Page.Root>
    );
};
