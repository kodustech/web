import { redirect } from "next/navigation";
import { getBYOK } from "@services/organizationParameters/fetch";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeamParametersNoCache } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { getPermissions } from "@services/permissions/fetch";
import { Action, ResourceType } from "@services/permissions/types";
import { getTeams } from "@services/teams/fetch";
import { auth } from "src/core/config/auth";
import { FEATURE_FLAGS } from "src/core/config/feature-flags";
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
import { AppRightSidebar } from "./right-sidebar";

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

    const platformConfigs = await getTeamParametersNoCache<{
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
        tokenUsagePageFeatureFlag,
        byokConfig,
        codeReviewDryRunFeatureFlag,
    ] = await Promise.all([
        getPermissions(),
        getOrganizationName(),
        validateOrganizationLicense({ teamId }),
        getUsersWithLicense({ teamId }),
        getFeatureFlagWithPayload({ feature: FEATURE_FLAGS.tokenUsagePage }),
        getBYOK(),
        getFeatureFlagWithPayload({ feature: FEATURE_FLAGS.codeReviewDryRun }),
    ]);

    const isBYOK = isBYOKSubscriptionPlan(organizationLicense);
    const isTrial = organizationLicense?.subscriptionStatus === "trial";

    const canManageCodeReview =
        !!permissions[ResourceType.CodeReviewSettings]?.[Action.Manage];

    return (
        <Providers
            session={session}
            teams={teams}
            organization={{
                id: organizationId,
                name: organizationName,
            }}
            permissions={permissions}
            isBYOK={isBYOK}
            isTrial={isTrial}>
            <SubscriptionProvider
                license={organizationLicense}
                usersWithAssignedLicense={usersWithAssignedLicense}>
                <NavMenu
                    tokenUsagePageFeatureFlag={tokenUsagePageFeatureFlag}
                />
                <FinishedTrialModal />
                <SubscriptionStatusTopbar />

                {isBYOK && !byokConfig?.main && <BYOKMissingKeyTopbar />}

                {children}

                <AppRightSidebar
                    showTestReview={
                        !!codeReviewDryRunFeatureFlag && canManageCodeReview
                    }
                />
            </SubscriptionProvider>
        </Providers>
    );
}
