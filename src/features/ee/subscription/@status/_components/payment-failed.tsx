"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader, CardTitle } from "@components/ui/card";
import { magicModal } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import type { TeamMembersResponse } from "@services/setup/types";
import { AlertTriangle, CircleDollarSign } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { pluralize } from "src/core/utils/string";
import { useSubscriptionStatus } from "src/features/ee/subscription/_hooks/use-subscription-status";

import { getPlans } from "../../_services/billing/fetch";
import { NewPlanSelectionModal } from "./_modals/select-new-plan";

export const PaymentFailed = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const { teamId } = useSelectedTeamId();
    const subscription = useSubscriptionStatus();
    const canEdit = usePermission(Action.Update, ResourceType.Billing);
    if (subscription.status !== "payment-failed") return null;

    const totalLicenses = subscription.numberOfLicenses;

    const assignedLicenses = subscription.usersWithAssignedLicense.length;
    const organizationAdminsCount = members.length;

    const [_getPlans, { loading: isLoadingPlans }] = useAsyncAction(
        async () => {
            const plans = await getPlans();
            magicModal.show(() => <NewPlanSelectionModal plans={plans} />);
        },
    );

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <AlertTriangle className="text-danger size-4" />

                        <span className="text-danger text-sm">
                            Payment failed
                        </span>
                    </div>
                    <CardTitle className="text-2xl">PRO plan</CardTitle>

                    <div className="mt-4 flex gap-6">
                        <p className="text-text-secondary text-sm">
                            <strong>{assignedLicenses}</strong> of{" "}
                            <strong>{totalLicenses}</strong> licenses assigned
                        </p>

                        <p className="text-text-secondary text-sm">
                            <strong>{organizationAdminsCount}</strong> workspace{" "}
                            {pluralize(organizationAdminsCount, {
                                singular: "member",
                                plural: "members",
                            })}
                        </p>
                    </div>
                </div>

                <Button
                    size="lg"
                    variant="primary"
                    className="h-fit"
                    loading={isLoadingPlans}
                    leftIcon={<CircleDollarSign />}
                    onClick={() => _getPlans()}>
                    Subscribe again
                </Button>
            </CardHeader>
        </Card>
    );
};
