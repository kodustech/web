"use client";

import { DataTable } from "@components/ui/data-table";
import { use } from "react";

import { TableFilterContext } from "../../_providers/table-filter-context";
import { columns, type LicenseTableRow } from "./columns";

import { toast } from "@components/ui/toaster/use-toast";
import {
    createOrUpdateOrganizationParameter,
} from "@services/organizationParameters/fetch";
import {
    OrganizationParametersConfigKey,
    type OrganizationParametersAutoAssignConfig,
} from "@services/parameters/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "src/core/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "src/core/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "src/core/components/ui/popover";
import { Switch } from "src/core/components/ui/switch";
import { cn } from "src/core/utils/components";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

import { useAsyncAction } from "@hooks/use-async-action";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

export const LicensesPageClient = ({
    data,
    autoLicenseAssignmentConfig,
}: {
    data: LicenseTableRow[];
    autoLicenseAssignmentConfig?: OrganizationParametersAutoAssignConfig;
}) => {
    const { query, setQuery } = use(TableFilterContext);
    const { organizationId } = useOrganizationContext();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pendingIgnoredUsers, setPendingIgnoredUsers] = useState<string[]>([]);

    const subscription = useSubscriptionStatus();
    const canEdit = usePermission(Action.Update, ResourceType.UserSettings);

    const [handleToggle, { loading: isToggling }] = useAsyncAction(
        async (checked: boolean) => {
            try {
                await createOrUpdateOrganizationParameter(
                    OrganizationParametersConfigKey.AUTO_LICENSE_ASSIGNMENT,
                    {
                        enabled: checked,
                        ignoredUsers:
                            autoLicenseAssignmentConfig?.ignoredUsers || [],
                    },
                    organizationId,
                );

                toast({
                    variant: "success",
                    title: "Auto license assignment updated",
                });

                router.refresh();
            } catch {
                toast({
                    variant: "danger",
                    title: "Failed to update auto license assignment",
                });
            }
        },
    );

    const [handleIgnoredUsersChange, { loading: isSavingIgnoredUsers }] =
        useAsyncAction(async () => {
            try {
                await createOrUpdateOrganizationParameter(
                    OrganizationParametersConfigKey.AUTO_LICENSE_ASSIGNMENT,
                    {
                        enabled: autoLicenseAssignmentConfig?.enabled || false,
                        ignoredUsers: pendingIgnoredUsers,
                    },
                    organizationId,
                );

                toast({
                    variant: "success",
                    title: "Ignored users updated",
                });

                setOpen(false);
                router.refresh();
            } catch {
                toast({
                    variant: "danger",
                    title: "Failed to update ignored users",
                });
            }
        });

    const toggleUser = (userId: string) => {
        setPendingIgnoredUsers((current) =>
            current.includes(userId)
                ? current.filter((id) => id !== userId)
                : [...current, userId],
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {canEdit && subscription.status === "active" && (
                <div className="flex flex-col gap-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <div className="text-base font-medium">
                                Auto-assign licenses
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Automatically assign licenses to new members when they join the organization.
                            </div>
                        </div>
                        <Switch
                            checked={autoLicenseAssignmentConfig?.enabled ?? false}
                            onCheckedChange={handleToggle}
                            loading={isToggling}
                            disabled={isToggling}
                        />
                    </div>

                    {autoLicenseAssignmentConfig?.enabled && (
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium">Ignored Users</div>
                            <div className="text-xs font-medium text-muted-foreground">
                                Select users to ignore from auto-assignment.
                            </div>
                            <Popover
                                open={open}
                                onOpenChange={(isOpen) => {
                                    if (isOpen) {
                                        setPendingIgnoredUsers(
                                            autoLicenseAssignmentConfig?.ignoredUsers || [],
                                        );
                                    }
                                    setOpen(isOpen);
                                }}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="helper"
                                        size="lg"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {autoLicenseAssignmentConfig?.ignoredUsers?.length
                                            ? `${autoLicenseAssignmentConfig.ignoredUsers.length} users ignored`
                                            : "Select users to ignore..."}
                                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[var(--radix-popover-trigger-width)] p-0"
                                    align="start"
                                >
                                    <Command>
                                        <CommandInput placeholder="Search users..." />
                                        <CommandList>
                                            <CommandEmpty>No user found.</CommandEmpty>
                                            <CommandGroup>
                                                {data.map((user) => (
                                                    <CommandItem
                                                        key={user.id}
                                                        value={user.name}
                                                        onSelect={() => toggleUser(user.id.toString())}
                                                    >
                                                    {user.name}
                                                        <Check
                                                            className={cn(
                                                                "mr-2 size-4",
                                                                pendingIgnoredUsers.includes(
                                                                    user.id.toString(),
                                                                )
                                                                    ? "opacity-100"
                                                                    : "opacity-0",
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                        <div className="border-t p-2">
                                            <Button
                                                className="w-full"
                                                size="sm"
                                                variant="primary"
                                                onClick={handleIgnoredUsersChange}
                                                loading={isSavingIgnoredUsers}
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
            )}
            <DataTable
                data={data}
                columns={columns}
                state={{ globalFilter: query }}
                onGlobalFilterChange={setQuery}
            />
        </div>
    );
};
