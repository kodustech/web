import { redirect } from "next/navigation";
import { MagicModalPortal } from "@components/ui/magic-modal";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeams } from "@services/teams/fetch";
import { auth } from "src/core/config/auth";
import { AllTeamsProvider } from "src/core/providers/all-teams-context";
import { AuthProvider } from "src/core/providers/auth.provider";
import { SelectedTeamProvider } from "src/core/providers/selected-team-context";
import { OrganizationProvider } from "src/features/organization/_providers/organization-context";

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
                        {props.children}
                        <MagicModalPortal />
                    </SelectedTeamProvider>
                </AllTeamsProvider>
            </OrganizationProvider>
        </AuthProvider>
    );
}
