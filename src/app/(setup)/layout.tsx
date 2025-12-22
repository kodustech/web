import { redirect } from "next/navigation";
import { MagicModalPortal } from "@components/ui/magic-modal";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import Link from "next/link";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeamParameters } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { getTeams } from "@services/teams/fetch";
import { auth } from "src/core/config/auth";
import { SupportDropdown } from "src/core/layout/navbar/_components/support";
import { AllTeamsProvider } from "src/core/providers/all-teams-context";
import { AuthProvider } from "src/core/providers/auth.provider";
import { SelectedTeamProvider } from "src/core/providers/selected-team-context";
import { PosthogProvider } from "src/core/providers/posthog.provider";
import { TEAM_STATUS } from "src/core/types";
import { getGlobalSelectedTeamId } from "src/core/utils/get-global-selected-team-id";
import { OrganizationProvider } from "src/features/organization/_providers/organization-context";

import { SetupGithubStars } from "./_components/setup-github-stars";
import { SetupUserNav } from "./_components/setup-user-nav";

export default async function Layout(props: React.PropsWithChildren) {
    const [
        teams,
        organizationId,
        organizationName,
        session,
    ] = await Promise.all([
        getTeams(),
        getOrganizationId(),
        getOrganizationName(),
        auth(),
    ]);

    const userStatus = session?.user?.status
        ? String(session.user.status).toLowerCase()
        : undefined;

    if (userStatus && ["pending", "pending_email"].includes(userStatus)) {
        redirect("/confirm-email");
    }

    // const hasActiveTeam = teams?.some(
    //     (team) => team.status === TEAM_STATUS.ACTIVE,
    // );

    // if (hasActiveTeam) {
    //     let shouldRedirect = false;

    //     try {
    //         const teamId = await getGlobalSelectedTeamId();
    //         const platformConfigs = await getTeamParameters<{
    //             configValue: { finishOnboard?: boolean };
    //         }>({
    //             key: ParametersConfigKey.PLATFORM_CONFIGS,
    //             teamId,
    //         });

    //         if (platformConfigs?.configValue?.finishOnboard) {
    //             shouldRedirect = true;
    //         }
    //     } catch {
    //         // If we can't get team ID or configs, continue with setup
    //     }

    //     if (shouldRedirect) {
    //         redirect("/");
    //     }
    // }

    return (
        <AuthProvider session={session}>
            <PosthogProvider>
                <OrganizationProvider
                    organization={{
                        id: organizationId,
                        name: organizationName,
                    }}>
                    <AllTeamsProvider teams={teams}>
                        <SelectedTeamProvider>
                            <div className="relative min-h-screen bg-background">
                                <div className="border-primary-dark bg-card-lv1 fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 border-b-2 px-6">
                                    <Link href="/">
                                        <SvgKodus className="h-8 max-w-max text-text-primary" />
                                    </Link>

                                    <div className="ml-auto flex items-center gap-4">
                                        <SetupGithubStars />
                                        <SupportDropdown />
                                        <SetupUserNav />
                                    </div>
                                </div>
                                <div className="pt-16">{props.children}</div>
                            </div>
                            <MagicModalPortal />
                        </SelectedTeamProvider>
                    </AllTeamsProvider>
                </OrganizationProvider>
            </PosthogProvider>
        </AuthProvider>
    );
}
