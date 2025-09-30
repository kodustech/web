"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader, CardTitle } from "@components/ui/card";
import { useAsyncAction } from "@hooks/use-async-action";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import type { TeamMembersResponse } from "@services/setup/types";
import { ArrowUpCircle } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { pluralize } from "src/core/utils/string";

import { createCheckoutSessionAction } from "../../_actions/create-checkout-session";

export const TrialExpired = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const { teamId } = useSelectedTeamId();
    const organizationAdminsCount = members.length;
    const licensesAvailableCount = 0;
    const canEdit = usePermission(Action.Update, ResourceType.Billing);

    const [createLinkToCheckout, { loading: isCreatingLinkToCheckout }] =
        useAsyncAction(async () => {
            const { url } = await createCheckoutSessionAction({ teamId });
            window.location.href = url;
        });

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <p className="text-text-secondary text-sm">
                        Trial finished
                    </p>
                    <CardTitle className="text-2xl">No subscription</CardTitle>

                    <div className="mt-4 flex gap-6">
                        <p className="text-text-secondary text-sm">
                            <strong>{licensesAvailableCount}</strong>{" "}
                            {pluralize(licensesAvailableCount, {
                                singular: "license",
                                plural: "licenses",
                            })}{" "}
                            available
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
                    leftIcon={<ArrowUpCircle />}
                    loading={isCreatingLinkToCheckout}
                    disabled={!canEdit}
                    onClick={() => {
                        createLinkToCheckout();
                    }}>
                    Upgrade
                </Button>
            </CardHeader>
        </Card>
    );
};
