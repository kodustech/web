"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader, CardTitle } from "@components/ui/card";
import { useAsyncAction } from "@hooks/use-async-action";
import type { TeamMembersResponse } from "@services/setup/types";
import { ArrowUpCircle } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { pluralize } from "src/core/utils/string";

import { createCheckoutSessionAction } from "../../_actions/create-checkout-session";

export const Trial = ({
    members,
}: {
    members: TeamMembersResponse["members"];
}) => {
    const { teamId } = useSelectedTeamId();
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
                    <p className="text-sm text-muted-foreground">
                        14 days free trial
                    </p>
                    <CardTitle>PRO plan</CardTitle>

                    <div className="mt-4 flex gap-6">
                        {/* <p className="text-sm text-muted-foreground">
                            <strong>5</strong> of <strong>7</strong> licenses
                            assigned
                        </p> */}

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
                    leftIcon={<ArrowUpCircle />}
                    loading={isCreatingLinkToCheckout}
                    onClick={() => createLinkToCheckout()}>
                    Upgrade
                </Button>
            </CardHeader>
        </Card>
    );
};
