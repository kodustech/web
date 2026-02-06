import Link from "next/link";
import { redirect } from "next/navigation";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { MagicModalPortal } from "@components/ui/magic-modal";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeams } from "@services/teams/fetch";
import { auth } from "src/core/config/auth";
import { SupportDropdown } from "src/core/layout/navbar/_components/support";
import { AllTeamsProvider } from "src/core/providers/all-teams-context";
import { AuthProvider } from "src/core/providers/auth.provider";
import { SelectedTeamProvider } from "src/core/providers/selected-team-context";
import { OrganizationProvider } from "src/features/organization/_providers/organization-context";

import { SetupGithubStars } from "./_components/setup-github-stars";
import { SetupUserNav } from "./_components/setup-user-nav";
import { SetupProgressSaver } from "./setup/_components/setup-step-tracker";

export default async function Layout(props: React.PropsWithChildren) {
    const [teams, organizationId, organizationName, session] =
        await Promise.all([
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

    return (
        <AuthProvider session={session}>
            <OrganizationProvider
                organization={{
                    id: organizationId,
                    name: organizationName,
                }}>
                <AllTeamsProvider teams={teams}>
                    <SelectedTeamProvider>
                        <SetupProgressSaver />
                        <div className="bg-background relative min-h-screen">
                            <div className="border-primary-dark bg-card-lv1 fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 border-b-2 px-6">
                                <Link href="/">
                                    <SvgKodus className="text-text-primary h-8 max-w-max" />
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
        </AuthProvider>
    );
}
