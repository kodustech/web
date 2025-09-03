"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { magicModal } from "@components/ui/magic-modal";
import type { getConnections } from "@services/setup/fetch";
import { RefreshCcwIcon } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import type { AwaitedReturnType } from "src/core/types";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

import { CODE_MANAGEMENT_PLATFORMS } from "../_constants";
import { ResetIntegrationModal } from "./_modals/reset-integration-modal";

export const GitConnectedProvider = ({
    connection,
}: {
    connection: AwaitedReturnType<typeof getConnections>[number];
}) => {
    const { teamId } = useSelectedTeamId();
    const { organizationId } = useOrganizationContext();

    const platformKey =
        connection.platformName.toLowerCase() as keyof typeof CODE_MANAGEMENT_PLATFORMS;
    const platform = CODE_MANAGEMENT_PLATFORMS[platformKey];

    return (
        <Card className="min-w-68">
            <CardHeader className="flex-row items-center justify-between gap-3 px-5 py-2.5">
                <div className="flex items-center gap-3">
                    <span className="*:size-6">
                        <platform.svg />
                    </span>

                    <span className="text-sm font-bold">
                        {platform.platformName}
                    </span>
                </div>

                <Button
                    size="xs"
                    variant="tertiary"
                    leftIcon={<RefreshCcwIcon />}
                    onClick={() => {
                        magicModal.show(() => (
                            <ResetIntegrationModal
                                platformName={platform.platformName}
                                organizationId={organizationId}
                                teamId={teamId}
                            />
                        ));
                    }}>
                    Reset
                </Button>
            </CardHeader>
        </Card>
    );
};
