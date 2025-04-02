"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader, CardTitle } from "@components/ui/card";
import { useAsyncAction } from "@hooks/use-async-action";
import type { TeamMembersResponse } from "@services/setup/types";
import { AlertTriangle, CircleDollarSign } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { pluralize } from "src/core/utils/string";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { createCheckoutSessionAction } from "../../_actions/create-checkout-session";

export const PaymentFailed = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const { teamId } = useSelectedTeamId();
    const subscription = useSubscriptionStatus();
    if (subscription.status !== "payment-failed") return null;

    const totalLicenses = subscription.numberOfLicenses;

    const assignedLicenses = subscription.usersWithAssignedLicense.length;
    const organizationAdminsCount = members.length;

    const [createLinkToCheckout, { loading: isCreatingLinkToCheckout }] =
        useAsyncAction(async () => {
            const { url } = await createCheckoutSessionAction({ teamId });
            window.location.href = url;
        });

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <AlertTriangle className="size-4 text-destructive" />

                        <span className="text-sm text-destructive">
                            Payment failed
                        </span>
                    </div>
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
                    leftIcon={<CircleDollarSign />}
                    loading={isCreatingLinkToCheckout}
                    onClick={() => {
                        createLinkToCheckout();
                    }}>
                    Subscribe again
                </Button>
            </CardHeader>
        </Card>
    );
};
