import { redirect } from "next/navigation";
import { getBYOK } from "@services/organizationParameters/fetch";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeamParameters } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { getPermissions } from "@services/permissions/fetch";
import { getTeams } from "@services/teams/fetch";
import { getDailyTokenUsage } from "@services/usage/fetch";
import { auth } from "src/core/config/auth";
import { NavMenu } from "src/core/layout/navbar";
import { TEAM_STATUS } from "src/core/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { getFeatureFlagWithPayload } from "src/core/utils/posthog-server-side";
import { BYOKMissingKeyTopbar } from "src/features/ee/byok/_components/missing-key-topbar";
import { isBYOKSubscriptionPlan } from "src/features/ee/byok/_utils";
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
    if (!session) {
        redirect("/sign-out");
    }

    const userStatus = session.user?.status
        ? String(session.user.status).toLowerCase()
        : undefined;

    if (userStatus && ["pending", "pending_email"].includes(userStatus)) {
        redirect("/confirm-email");
    }

    const teams = await getTeams();

    if (!teams.some((team) => team.status === TEAM_STATUS.ACTIVE)) {
        redirect("/setup");
    }

    const teamId = await getGlobalSelectedTeamId();

    const platformConfigs = await getTeamParameters<{
        configValue: { finishOnboard?: boolean };
    }>({
        key: ParametersConfigKey.PLATFORM_CONFIGS,
        teamId,
    });

    if (!platformConfigs?.configValue?.finishOnboard) {
        redirect("/setup");
    }

    const organizationId = await getOrganizationId();

    const [
        permissions,
        organizationName,
        organizationLicense,
        usersWithAssignedLicense,
        issuesPageFeatureFlag,
        logsPagesFeatureFlag,
        pullRequestsPageFeatureFlag,
        byokConfig,
    ] = await Promise.all([
        getPermissions(),
        getOrganizationName(),
        validateOrganizationLicense({ teamId }),
        getUsersWithLicense({ teamId }),
        getFeatureFlagWithPayload({ feature: "issues-page" }),
        getFeatureFlagWithPayload({ feature: "logs-pages" }),
        getFeatureFlagWithPayload({ feature: "pull-requests-pages" }),
        getBYOK(),
    ]);

    const isBYOK = isBYOKSubscriptionPlan(organizationLicense);

    return (
        <Providers
            session={session}
            teams={teams}
            organization={{
                id: organizationId,
                name: organizationName,
            }}
            permissions={permissions}
            isBYOK={isBYOK}>
            <SubscriptionProvider
                license={organizationLicense}
                usersWithAssignedLicense={usersWithAssignedLicense}>
                <NavMenu
                    issuesPageFeatureFlag={issuesPageFeatureFlag}
                    logsPagesFeatureFlag={logsPagesFeatureFlag}
                    pullRequestsPageFeatureFlag={pullRequestsPageFeatureFlag}
                />
                <FinishedTrialModal />
                <SubscriptionStatusTopbar />

                {isBYOK && !byokConfig?.main && <BYOKMissingKeyTopbar />}

                {children}
            </SubscriptionProvider>
        </Providers>
    );
}
