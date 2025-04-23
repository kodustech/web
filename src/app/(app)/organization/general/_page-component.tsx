"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { FormControl } from "@components/ui/form-control";
import { Page } from "@components/ui/page";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { createOrUpdateOrganizationParameter } from "@services/organizationParameters/fetch";
import {
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
    timezone: Timezone;
}) => {
    const { organizationId } = useOrganizationContext();
    const [timezone, setTimezone] = useState<Timezone>(props.timezone);
    const router = useRouter();

    const [saveSettings, { loading: isLoadingSubmitButton }] = useAsyncAction(
        async () => {
            try {
                const response = await createOrUpdateOrganizationParameter(
                    OrganizationParametersConfigKey.TIMEZONE_CONFIG,
                    timezone,
                    organizationId,
                );

                if (response?.error) {
                    throw new Error(
                        `An error occurred while setting organization parameter`,
                    );
                }

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

    return (
        <Page.Root>
            <Page.Header>
                <Page.Title>General settings</Page.Title>

                <Page.HeaderActions>
                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<Save />}
                        disabled={timezone === props.timezone}
                        onClick={saveSettings}
                        loading={isLoadingSubmitButton}>
                        Save settings
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content>
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
            </Page.Content>
        </Page.Root>
    );
};
