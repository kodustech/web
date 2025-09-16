import { redirect } from "next/navigation";
import { SetupAndOnboardingLock } from "@components/system/setup-lock";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getPermissions } from "@services/permissions/fetch";
import { getTeams } from "@services/teams/fetch";
import { auth } from "src/core/config/auth";
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

import { Providers } from "./providers";

export default async function Layout({ children }: React.PropsWithChildren) {
    const session = await auth();
    if (!session) redirect("/sign-out");

    const [teams, teamId, organizationId, organizationName, permissions] =
        await Promise.all([
            getTeams(),
            getGlobalSelectedTeamId(),
            getOrganizationId(),
            getOrganizationName(),
            getPermissions(),
        ]);

    const [
        organizationLicense,
        usersWithAssignedLicense,
        issuesPageFeatureFlag,
        logsPagesFeatureFlag,
        pullRequestsPageFeatureFlag,
    ] = await Promise.all([
        validateOrganizationLicense({ teamId }),
        getUsersWithLicense({ teamId }),
        getFeatureFlagWithPayload({ feature: "issues-page" }),
        getFeatureFlagWithPayload({ feature: "logs-pages" }),
        getFeatureFlagWithPayload({ feature: "pull-requests-pages" }),
    ]);

    return (
        <Providers
            session={session}
            teams={teams}
            organization={{
                id: organizationId,
                name: organizationName,
            }}
            permissions={permissions}>
            <SubscriptionProvider
                license={organizationLicense}
                usersWithAssignedLicense={usersWithAssignedLicense}>
                <SetupAndOnboardingLock />
                <NavMenu
                    issuesPageFeatureFlag={issuesPageFeatureFlag}
                    logsPagesFeatureFlag={logsPagesFeatureFlag}
                    pullRequestsPageFeatureFlag={pullRequestsPageFeatureFlag}
                />
                <FinishedTrialModal />
                <SubscriptionStatusTopbar />
                {children}
            </SubscriptionProvider>
        </Providers>
    );
}
