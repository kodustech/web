"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader, CardTitle } from "@components/ui/card";
import { useAsyncAction } from "@hooks/use-async-action";
import type { TeamMembersResponse } from "@services/setup/types";
import { CircleDollarSign } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { pluralize } from "src/core/utils/string";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { createManageBillingLinkAction } from "../../_actions/create-manage-billing-link";

export const Active = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const { teamId } = useSelectedTeamId();
    const subscription = useSubscriptionStatus();
    if (subscription.status !== "active") return null;

    const totalLicenses = subscription.numberOfLicenses;

    const assignedLicenses = subscription.usersWithAssignedLicense.length;
    const organizationAdminsCount = members.length;

    const [
        createLinkToManageBilling,
        { loading: isCreatingLinkToManageBilling },
    ] = useAsyncAction(async () => {
        const { url } = await createManageBillingLinkAction({ teamId });
        window.location.href = url;
    });

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        Monthly subscription
                    </p>
                    <CardTitle>PRO plan</CardTitle>

                    <div className="mt-4 flex gap-6">
                        <p className="text-sm text-muted-foreground">
                            <strong>{assignedLicenses}</strong> of{" "}
                            <strong>{totalLicenses}</strong> licenses assigned
                        </p>

                        <p className="text-sm text-muted-foreground">
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
                    variant="outline"
                    leftIcon={<CircleDollarSign />}
                    loading={isCreatingLinkToManageBilling}
                    onClick={() => createLinkToManageBilling()}>
                    Manage billing
                </Button>
            </CardHeader>
        </Card>
    );
};
