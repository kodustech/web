"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader, CardTitle } from "@components/ui/card";
import { magicModal } from "@components/ui/magic-modal";
import { useAsyncAction } from "@hooks/use-async-action";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import type { TeamMembersResponse } from "@services/setup/types";
import { ArrowUpCircle } from "lucide-react";
import { pluralize } from "src/core/utils/string";
import { capturePosthogEvent } from "src/core/utils/posthog-client";

import { useSubscriptionStatus } from "../../_hooks/use-subscription-status";
import { getPlans } from "../../_services/billing/fetch";
import { NewPlanSelectionModal } from "./_modals/select-new-plan";

export const FreeByok = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const subscription = useSubscriptionStatus();
    if (subscription.status !== "free") return null;

    const organizationAdminsCount = members.length;

    const canEdit = usePermission(Action.Update, ResourceType.Billing);

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
                    <p className="text-text-secondary text-sm">Free (BYOK)</p>
                    <CardTitle className="text-2xl">
                        Community version
                    </CardTitle>

                    <div className="mt-4 flex gap-6">
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
                    leftIcon={<ArrowUpCircle />}
                    onClick={() => {
                        capturePosthogEvent({
                            event: "upgrade_clicked",
                            properties: {
                                feature: "subscription_status_free",
                                status: subscription.status,
                            },
                        });
                        _getPlans();
                    }}>
                    Upgrade
                </Button>
            </CardHeader>
        </Card>
    );
};
