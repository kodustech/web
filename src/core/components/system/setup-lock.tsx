"use client";

import { redirect } from "next/navigation";
import { useSetupLock } from "@hooks/use-setup-lock";
import { useSuspenseGetParameterPlatformConfigs } from "@services/parameters/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

export const SetupAndOnboardingLock = () => {
    useSetupLock();

    const { teamId } = useSelectedTeamId();
    const { configValue } = useSuspenseGetParameterPlatformConfigs(teamId);

    if (!configValue.finishOnboard) redirect("/setup");

    return null;
};
