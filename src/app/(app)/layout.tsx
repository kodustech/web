import { redirect } from "next/navigation";
import { SetupAndOnboardingLock } from "@components/system/setup-lock";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeams } from "@services/teams/fetch";
import { NavMenu } from "src/core/layout/navbar";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";
import { FinishedTrialModal } from "src/features/ee/subscription/_components/finished-trial-modal";
import { SubscriptionStatusTopbar } from "src/features/ee/subscription/_components/subscription-status-topbar";
import { SubscriptionProvider } from "src/features/ee/subscription/_providers/subscription-context";
import {
    getUsersWithLicense,
    validateOrganizationLicense,
} from "src/features/ee/subscription/_services/billing/fetch";
import { getJwtPayload } from "src/lib/auth/utils";

import { Providers } from "./providers";

export default async function Layout({ children }: React.PropsWithChildren) {
    const jwtPayload = await getJwtPayload();
    if (!jwtPayload) return redirect("/sign-in");

    const [teams, teamId, organizationId, organizationName] = await Promise.all(
        [
            getTeams(),
            getGlobalSelectedTeamId(),
            getOrganizationId(),
            getOrganizationName(),
        ],
    );

    const [
        organizationLicense,
        usersWithAssignedLicense,
        issuesPageFeatureFlag,
        logsPagesFeatureFlag,
    ] = await Promise.all([
        validateOrganizationLicense({ teamId }),
        getUsersWithLicense({ teamId }),
        getFeatureFlagWithPayload({ feature: "issues-page" }),
        getFeatureFlagWithPayload({ feature: "logs-pages" }),
    ]);

    return (
        <Providers
            jwtPayload={jwtPayload}
            teams={teams}
            organization={{
                id: organizationId,
                name: organizationName,
            }}>
            <SubscriptionProvider
                license={organizationLicense}
                usersWithAssignedLicense={usersWithAssignedLicense}>
                <SetupAndOnboardingLock />
                <NavMenu 
                    issuesPageFeatureFlag={issuesPageFeatureFlag} 
                    logsPagesFeatureFlag={logsPagesFeatureFlag}
                />
                <FinishedTrialModal />
                <SubscriptionStatusTopbar />
                {children}
            </SubscriptionProvider>
        </Providers>
    );
}
