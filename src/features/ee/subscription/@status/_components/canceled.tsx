"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader, CardTitle } from "@components/ui/card";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import type { TeamMembersResponse } from "@services/setup/types";
import { CircleDollarSign } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { pluralize } from "src/core/utils/string";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { createManageBillingLinkAction } from "../../_actions/create-manage-billing-link";

export const Canceled = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const { teamId } = useSelectedTeamId();
    const subscription = useSubscriptionStatus();
    if (subscription.status !== "canceled") return null;

    const totalLicenses = subscription.numberOfLicenses;

    const assignedLicenses = subscription.usersWithAssignedLicense.length;
    const organizationAdminsCount = members.length;

    const [
        createLinkToManageBilling,
        { loading: isCreatingLinkToManageBilling },
    ] = useAsyncAction(async () => {
        try {
            const { url } = await createManageBillingLinkAction({ teamId });
            window.location.href = url;
        } catch {
            toast({
                title: "Failed to create billing link",
                description: "Please try again later",
                variant: "warning",
            });
        }
    });

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <p className="text-destructive text-sm">
                        Canceled subscription
                    </p>
                    <CardTitle className="text-2xl">PRO plan</CardTitle>

                    <div className="mt-4 flex gap-6">
                        <p className="text-text-secondary text-sm">
                            <strong>{assignedLicenses}</strong> of{" "}
                            <strong>{totalLicenses}</strong> licenses assigned
                        </p>

                        <p className="text-text-secondary text-sm">
                            <strong>{organizationAdminsCount}</strong>{" "}
                            organization{" "}
                            {pluralize(organizationAdminsCount, {
                                singular: "admin",
                                plural: "admins",
                            })}
                        </p>
                    </div>
                </div>

                <Button
                    size="lg"
                    variant="primary"
                    className="h-fit"
                    leftIcon={<CircleDollarSign />}
                    loading={isCreatingLinkToManageBilling}
                    onClick={() => createLinkToManageBilling()}>
                    Subscribe again
                </Button>
            </CardHeader>
        </Card>
    );
};
