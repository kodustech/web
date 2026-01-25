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
import { isFeatureEnabled } from "src/core/utils/posthog-server-side";
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

    let teams;
    try {
        teams = await getTeams();
    } catch (err) {
        console.error("[Layout] Failed to fetch teams:", err);
        // Re-throw to trigger global-error.tsx
        throw new Error("Failed to load teams. Please try again later.");
    }

    if (!teams?.some((team) => team.status === TEAM_STATUS.ACTIVE)) {
        redirect("/setup");
    }

    const teamId = await getGlobalSelectedTeamId();

    const platformConfigs = await getTeamParametersNoCache<{
        configValue: { finishOnboard?: boolean };
    }>({
        key: ParametersConfigKey.PLATFORM_CONFIGS,
        teamId,
    }).catch((err) => {
        console.error("[Layout] Failed to fetch platform configs:", err);
        return null;
    });

    // Only redirect to setup if we're sure onboarding isn't finished
    // If the API failed, assume user is onboarded to avoid blocking access
    if (platformConfigs && !platformConfigs?.configValue?.finishOnboard) {
        redirect("/setup");
    }

    const organizationId = await getOrganizationId();

    const [
        permissions,
        organizationName,
        organizationLicense,
        usersWithAssignedLicense,
        byokConfig,
        tokenUsagePageFeatureFlag,
        codeReviewDryRunFeatureFlag,
        committableSuggestionsFeatureFlag,
        ssoFeatureFlag,
        cliKeysFeatureFlag,
        kodyRuleSuggestionsFeatureFlag,
    ] = await Promise.all([
        getPermissions().catch(() => ({})),
        getOrganizationName().catch(() => ""),
        validateOrganizationLicense({ teamId }).catch(() => null),
        getUsersWithLicense({ teamId }).catch(() => []),
        getBYOK().catch(() => null),
        isFeatureEnabled({ feature: FEATURE_FLAGS.tokenUsagePage }).catch(() => false),
        isFeatureEnabled({ feature: FEATURE_FLAGS.codeReviewDryRun }).catch(() => false),
        isFeatureEnabled({
            feature: FEATURE_FLAGS.committableSuggestions,
            identifier: "organization",
        }).catch(() => false),
        isFeatureEnabled({ feature: FEATURE_FLAGS.sso }).catch(() => false),
        isFeatureEnabled({ feature: FEATURE_FLAGS.cliKeys }).catch(() => false),
        isFeatureEnabled({
            feature: FEATURE_FLAGS.kodyRuleSuggestions,
        }).catch(() => false),
    ]);

    const isBYOK = isBYOKSubscriptionPlan(organizationLicense);
    const isTrial = organizationLicense?.subscriptionStatus === "trial";

    const canManageCodeReview =
        !!permissions[ResourceType.CodeReviewSettings]?.[Action.Manage];

    const featureFlags = {
        committableSuggestions: committableSuggestionsFeatureFlag,
        codeReviewDryRun: codeReviewDryRunFeatureFlag,
        tokenUsagePage: tokenUsagePageFeatureFlag,
        sso: ssoFeatureFlag,
        cliKeys: cliKeysFeatureFlag,
        kodyRuleSuggestions: kodyRuleSuggestionsFeatureFlag,
    };

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
            isTrial={isTrial}
            featureFlags={featureFlags}>
            <SubscriptionProvider
                license={organizationLicense}
                usersWithAssignedLicense={usersWithAssignedLicense}>
                <NavMenu />
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
