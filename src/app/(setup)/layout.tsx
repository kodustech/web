import { redirect } from "next/navigation";
import { MagicModalPortal } from "@components/ui/magic-modal";
import {
    getOrganizationId,
    getOrganizationName,
} from "@services/organizations/fetch";
import { getTeams } from "@services/teams/fetch";
import { getUserInfo } from "@services/users/fetch";
import { AllTeamsProvider } from "src/core/providers/all-teams-context";
import { AuthProvider } from "src/core/providers/auth.provider";
import { SelectedTeamProvider } from "src/core/providers/selected-team-context";
import { OrganizationProvider } from "src/features/organization/_providers/organization-context";
import { getJwtPayload } from "src/lib/auth/utils";

export default async function Layout(props: React.PropsWithChildren) {
    const jwtPayload = await getJwtPayload();
    if (!jwtPayload) return redirect("/sign-in");

    const [userInfo, teams, organizationId, organizationName] =
        await Promise.all([
            getUserInfo(),
            getTeams(),
            getOrganizationId(),
            getOrganizationName(),
        ]);

    return (
        <AuthProvider user={userInfo} jwtPayload={jwtPayload}>
            <OrganizationProvider
                organization={{ id: organizationId, name: organizationName }}>
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
